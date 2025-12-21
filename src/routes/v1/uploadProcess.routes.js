import express from "express";
import { enqueueFileProcessing } from "../../controllers/v1/uploadProcess.controller.js";
import { uploadJobFile } from "../../controllers/v1/upload.controller.js";
import authenticate from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { upload } from "../../middlewares/upload.js";

const router = express.Router();

router.post(
  "/file",
  authenticate,
  authorize("user", "admin"),
  upload.single("file"),
  uploadJobFile,
);

router.post("/process", enqueueFileProcessing);

export default router;
