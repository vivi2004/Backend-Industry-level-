import Task from "../../models/Task.js";
import Project from "../../models/Project.js";
import redis from "../../config/redis.js";

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
  const cacheKey = `tasks:${req.params.projectId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const tasks = await Task.find({
    project: req.params.projectId,
    deleteAt: null,
  });

  await redis.set(cacheKey, JSON.stringify(tasks), "EX", 10);

  res.json(tasks);
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



