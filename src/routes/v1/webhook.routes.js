import express from "express";
import { fileProcessedWebhook } from "../../controllers/v1/webhook.controller.js";
import { requireWorker } from "../../middlewares/workerAuth.js";

const router = express.Router();

// Public webhook for worker — no auth, no body parser override
router.post("/file-processed", requireWorker, fileProcessedWebhook);

export default router;
