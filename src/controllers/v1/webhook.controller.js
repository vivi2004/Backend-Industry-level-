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
    // Only worker is allowed
    if (!validateWorkerSecret(req)) {
      return res.status(401).json({ message: "Unauthorized worker" });
    }

    let { jobId, extractedText, summary, progress, event, error, data } = req.body;

    // Support deeply nested payloads from worker
    const payload = data || {};

    if (!jobId) jobId = payload.jobId;
    if (!extractedText) extractedText = payload.extractedText;
    if (!summary) summary = payload.summary;
    if (typeof progress !== "number" && typeof payload.progress === "number") {
      progress = payload.progress;
    }

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    // Record timeline events
    if (event) {
      await Job.findByIdAndUpdate(jobId, {
        $push: { timeline: { event, timestamp: new Date() } }
      });

      if (event === "job_cancelled") {
        await Job.findByIdAndUpdate(jobId, { status: "cancelled" });
        return res.json({ message: "Job cancelled", jobId, status: "cancelled" });
      }
    }

    const update = {};

    // Worker-side error
    if (error) {
      update.status = "failed";
      update.error = error;
    }

    // OCR progress
    if (typeof progress === "number") {
      await Job.findByIdAndUpdate(jobId, { progress });
    }

    // OCR text extraction
    if (!error && typeof extractedText === "string" && extractedText.trim().length > 0) {
      update.extractedText = extractedText.trim();
      update.status = "extracted";
    }

    // AI summary result
    if (!error && typeof summary === "string" && summary.trim().length > 0) {
      update.summary = summary.trim();
      update.status = "completed";

      // Optional: send email notification
      try {
        const job = await Job.findById(jobId).populate("user");
        if (job?.user?.email) {
          sendJobCompletedEmail(job.user.email, summary);
        }
      } catch (emailErr) {
        console.warn("Email sending failed:", emailErr);
      }
    }

    // Apply updates
    const updatedJob = await Job.findByIdAndUpdate(jobId, update, { new: true });
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Auto-trigger summarization once OCR completes
    if (
      !error &&
      extractedText &&
      (!summary || summary.trim().length === 0)
    ) {
      if (fileProcessingQueue) {
      await fileProcessingQueue.add("ai-summarize", {
        jobId,
        text: extractedText
      });
    } else {
      console.log("Queue disabled - summarization skipped in webhook");
    }
    }

    return res.json({
      message: "Webhook processed successfully",
      jobId,
      status: updatedJob.status
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Webhook handler crashed" });
  }
};
