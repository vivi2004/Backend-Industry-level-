import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../../controllers/v1/project.controller.js";

import { upload } from "../../middlewares/upload.js";
import { uploadLimiter } from "../../middlewares/rateLimit.js";
import { uploadProjectAttachment } from "../../controllers/v1/upload.controller.js";

import { validate } from "../../middlewares/validate.js";
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from "../../validations/project.validation.js";

const router = Router();
router.use(auth);
router.post(
  "/",
  authorize("admin", "user"),
  validate(createProjectSchema),
  createProject
);
router.get(
  "/",
  authorize("admin", "user"),
  getProjects
);
router.put(
  "/:id",
  authorize("admin", "user"),
  validate(projectIdSchema),
  validate(updateProjectSchema),
  updateProject
);
router.delete(
  "/:id",
  authorize("admin", "user"),
  validate(projectIdSchema),
  deleteProject
);
router.post(
  "/:id/attachments",
  authorize("admin", "user"),
  validate(projectIdSchema),
  uploadLimiter,
  upload.single("file"),
  uploadProjectAttachment
);
export default router;
