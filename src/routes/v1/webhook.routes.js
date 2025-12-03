import express from "express";
import { fileProcessedWebhook } from "../../controllers/v1/webhook.controller.js";

const router = express.Router();

router.post("/file-processed", express.json(), fileProcessedWebhook);

export default router;
