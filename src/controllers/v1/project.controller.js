import Project from "../../models/Project.js";
import redis from "../../config/redis.js";
import { getPagination } from "../../utils/paginate.js";

export const createProject = async (req, res) => {
  const project = await Project.create({ ...req.body, owner: req.user._id });
  await redis.del(`projects:${req.user._id}`);
  if (req.user.role === "admin") await redis.del("projects:admin");
  res.json(project);
};

export const getProjects = async (req, res) => {
  const key =
    req.user.role === "admin" ? "projects:admin" : `projects:${req.user._id}`;

  const cached = await redis.get(key);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  let projects;
  if (req.user.role === "admin") {
    projects = await Project.find({ deletedAt: null });
  } else {
    projects = await Project.find({ owner: req.user._id, deletedAt: null });
  }

  await redis.set(key, JSON.stringify(projects), "EX", 10);

  res.json(projects);
};

export const updateProject = async (req, res) => {
  const updated = await Project.findOneAndUpdate(
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true },
  );
  await redis.del(`projects:${req.user._id}`);
  if (req.user.role === "admin") await redis.del("projects:admin");
  res.json(updated);
};

export const deleteProject = async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, owner: req.user._id };

  const updated = await Project.findOneAndUpdate(
    filter,
    { deletedAt: new Date() },
    { new: true },
  );

  if (!updated) {
    return res
      .status(404)
      .json({ message: "Project not found or not allowed" });
  }
  await redis.del(`projects:${req.user._id}`);
  if (req.user.role === "admin") await redis.del("projects:admin");
  res.json({ message: "Soft deleted", project: updated });
};
