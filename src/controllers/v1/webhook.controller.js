import User from "../../models/User.js";
import Job from "../../models/Job.js";
import { sendJobCompletedEmail } from "../../utils/mailer.js";
import { fileProcessingQueue } from "../../queues/fileProcessing.queue.js";

// Validate worker secret
const validateWorkerSecret = (req) => {
  const secret = req.headers["x-worker-secret"];
  return secret && secret === process.env.WORKER_SECRET;
};

export const fileProcessedWebhook = async (req, res) => {
  try {
    // Reject requests that are not from the worker
    if (!validateWorkerSecret(req)) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    const { jobId, extractedText, summary, progress, event, error, data } = req.body;
    const payload = data || {};

    const finalExtractedText =
      typeof extractedText === "string" && extractedText.length
        ? extractedText
        : typeof payload.extractedText === "string"
        ? payload.extractedText
        : undefined;

    const finalSummary =
      typeof summary === "string" && summary.length
        ? summary
        : typeof payload.summary === "string"
        ? payload.summary
        : undefined;

    const finalProgress =
      typeof progress === "number"
        ? progress
        : typeof payload.progress === "number"
        ? payload.progress
        : undefined;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    // Timeline logging
    if (event) {
      await Job.findByIdAndUpdate(jobId, {
        $push: { timeline: { event, timestamp: new Date() } }
      });

      // Cancellation from worker
      if (event === "job_cancelled") {
        await Job.findByIdAndUpdate(jobId, { status: "cancelled" });
        return res.json({ message: "Job cancelled", jobId, status: "cancelled" });
      }
    }

    const update = {};

    // Worker error
    if (error) {
      update.status = "failed";
      update.error = error;
    }

    // OCR progress (not job status change)
    if (typeof finalProgress === "number") {
      await Job.findByIdAndUpdate(jobId, { progress: finalProgress });
    }

    // OCR result
    if (!error && finalExtractedText) {
      update.extractedText = finalExtractedText;
      update.status = "extracted";
    }

    // Summary result
    if (!error && finalSummary) {
      update.summary = finalSummary;
      update.status = "completed";
    }

    const job = await Job.findByIdAndUpdate(jobId, update, { new: true });
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Auto-run summarization when OCR is done but summary missing
    if (!error && finalExtractedText && !finalSummary) {
      await fileProcessingQueue.add("ai-summarize", { jobId, text: finalExtractedText });
    }

    return res.json({
      message: "Webhook processed",
      jobId,
      status: update.status || job.status || "processing"
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Webhook handler crashed" });
  }
};
