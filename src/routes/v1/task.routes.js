import { Router } from "express";
import auth from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../../controllers/v1/task.controller.js";

import { upload } from "../../middlewares/upload.js";
import { uploadTaskAttachment } from "../../controllers/v1/upload.controller.js";

const router = Router({ mergeParams: true });
router.use(auth);
router.post("/", authorize("admin", "user"), createTask);
router.get("/", authorize("admin", "user"), getTasks);
router.put("/:taskId", authorize("admin", "user"), updateTask);
router.delete("/:taskId", authorize("admin", "user"), deleteTask);

router.post(
  "/:taskId/attachments",
  authorize("admin", "user"),
  upload.single("file"),
  uploadTaskAttachment,
);


export default router;
