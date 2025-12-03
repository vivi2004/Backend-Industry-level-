import express from "express";
import { enqueueFileProcessing } from "../../controllers/v1/uploadProcess.controller.js";

const router = express.Router();

router.post("/process", enqueueFileProcessing);

export default router;
