import Task from "../../models/Task.js";
import Project from "../../models/Project.js";
import redis from "../../config/redis.js";
import { getPagination } from "../../utils/paginate.js";

export const createTask = async (req, res) => {
  if (req.user.role !== "admin") {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });
    if (!project) {
      return res.status(403).json({ message: "Not allowed" });
    }
  }
  const task = await Task.create({
    ...req.body,
    project: req.params.projectId,
  });
  await redis.del(`tasks:${req.params.projectId}`);
  res.json(task);
};

export const getTasks = async (req, res) => {
  if (req.user.role !== "admin") {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });
    if (!project) {
      return res.status(403).json({ message: "Not allowed" });
    }
  }

  const { page, limit, skip } = getPagination(req.query);

  const cacheKey = `tasks:${req.params.projectId}:page:${page}:limit:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const filter = {
    project: req.params.projectId,
    deleteAt: null,
  };

  const [tasks, total] = await Promise.all([
    Task.find(filter).skip(skip).limit(limit),
    Task.countDocuments(filter),
  ]);

  const response = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: tasks,
  };

  await redis.set(cacheKey, JSON.stringify(response), "EX", 10);

  res.json(response);
};

export const updateTask = async (req, res) => {
  if (req.user.role !== "admin") {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });
    if (!project) {
      return res.status(403).json({ message: "Not allowed" });
    }
  }
  const updated = await Task.findByIdAndUpdate(
    { _id: req.params.taskId, deleteAt: null },
    req.body,
    { new: true },
  );

  if (!updated) {
    return res
      .status(404)
      .json({ message: "Task not found or already deleted" });
  }
  await redis.del(`tasks:${req.params.projectId}`);
  res.json(updated);
};

export const deleteTask = async (req, res) => {
  if (req.user.role !== "admin") {
    const project = await Project.findOne({
      _id: req.params.projectId,
      owner: req.user._id,
    });
    if (!project) {
      return res.status(403).json({ message: "Not allowed" });
    }
  }
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.taskId, deleteAt: null },
    { deleteAt: new Date() },
    { new: true },
  );

  if (!updated) {
    return res
      .status(404)
      .json({ message: "Task not found or already deleted" });
  }
  await redis.del(`tasks:${req.params.projectId}`);
  res.json({ message: "Soft deleted", task: updated });
};
