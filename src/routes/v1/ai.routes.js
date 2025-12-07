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

/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI processing endpoints
 */

/**
 * @swagger
 * /ai/extract-text:
 *   post:
 *     summary: Extract text from an uploaded file using AI
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileUrl
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/.../sample.pdf"
 *     responses:
 *       200:
 *         description: AI text extraction job queued
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/extract-text",
  authenticate,
  authorize("user", "admin"),
  validate(aiExtractSchema),
  enqueueAiTextExtraction,
);

/**
 * @swagger
 * /ai/summarize:
 *   post:
 *     summary: Generate AI summary from extracted text
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Your extracted text here..."
 *     responses:
 *       200:
 *         description: AI summarization job queued
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/summarize",
  authenticate,
  authorize("user", "admin"),
  validate(aiSummarizeSchema),
  enqueueAiSummarization,
);

export default router;
