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
import { uploadProjectAttachment } from "../../controllers/v1/upload.controller.js";

const router = Router();
router.use(auth);
router.post("/", authorize("admin", "user"), createProject);
router.get("/", authorize("admin", "user"), getProjects);
router.put("/:id", authorize("admin", "user"), updateProject);
router.delete("/:id", authorize("admin", "user"), deleteProject);
router.post(
  "/:id/attachments",
  authorize("admin", "user"),
  upload.single("file"),
  uploadProjectAttachment,
);
export default router;

