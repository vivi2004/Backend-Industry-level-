import { Router } from "express";
import {
  enqueueAiTextExtraction,
  enqueueAiSummarization,
} from "../../controllers/v1/aiProcess.controller.js";
import authenticate from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import {
  aiExtractSchema,
  aiSummarizeSchema,
} from "../../validations/ai.validation.js";
import  {authLimiter}  from "../../middlewares/rateLimit.js";

const router = Router();

router.post("/login", authLimiter);
router.post("/register", authLimiter);


router.post(
  "/extract-text",
  authenticate,
  authorize("user", "admin"),
  validate(aiExtractSchema),
  enqueueAiTextExtraction,
);

router.post(
  "/summarize",
  authenticate,
  authorize("user", "admin"),
  validate(aiSummarizeSchema),
  enqueueAiSummarization,
);

export default router;
