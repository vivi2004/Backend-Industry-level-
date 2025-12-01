import fs from "fs/promises";
import cloudinary from "../../config/cloudinary.js";
import Project from "../../models/Project.js";
import Task from "../../models/Task.js";

export const uploadProjectAttachment = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check project ownership (unless admin)
    const projectFilter =
      req.user.role === "admin"
        ? { _id: projectId, deletedAt: null }
        : { _id: projectId, owner: req.user._id, deletedAt: null };

    const project = await Project.findOne(projectFilter);
    if (!project) {
      await fs.unlink(req.file.path);
      return res
        .status(403)
        .json({ message: "Project not found or not allowed" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tasks-api/projects",
    });

    await fs.unlink(req.file.path); // clean local temp file

    const attachment = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };

    project.attachments.push(attachment);
    await project.save();

    res.json({ message: "File uploaded", attachment, projectId });
  } catch (err) {
    console.error(err);
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ message: "Upload failed" });
  }
};

export const uploadTaskAttachment = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check project ownership for non-admin
    const projectFilter =
      req.user.role === "admin"
        ? { _id: projectId, deletedAt: null }
        : { _id: projectId, owner: req.user._id, deletedAt: null };

    const project = await Project.findOne(projectFilter);
    if (!project) {
      await fs.unlink(req.file.path);
      return res
        .status(403)
        .json({ message: "Project not found or not allowed" });
    }

    const task = await Task.findOne({
      _id: taskId,
      project: projectId,
      deletedAt: null,
    });

    if (!task) {
      await fs.unlink(req.file.path);
      return res.status(404).json({ message: "Task not found" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tasks-api/tasks",
    });

    await fs.unlink(req.file.path);

    const attachment = {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };

    task.attachments.push(attachment);
    await task.save();

    res.json({ message: "File uploaded", attachment, taskId, projectId });
  } catch (err) {
    console.error(err);
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ message: "Upload failed" });
  }
};
