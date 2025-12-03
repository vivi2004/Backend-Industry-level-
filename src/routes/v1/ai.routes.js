import { Router } from "express";
import { enqueueAiTextExtraction } from "../../controllers/v1/aiProcess.controller.js";
import authenticate from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";

const router = Router();

router.post(
  "/extract-text",
  authenticate,
  authorize(["user", "admin"]),
  enqueueAiTextExtraction
);

export default router;
