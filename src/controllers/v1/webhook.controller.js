import User from "../../models/User.js";
import Job from "../../models/Job.js";
import { sendJobCompletedEmail } from "../../utils/mailer.js";
import { fileProcessingQueue } from "../../queues/fileProcessing.queue.js";

export const fileProcessedWebhook = async (req, res) => {
  try {
    const {
      jobId,
      fileUrl,
      processedUrl,
      extractedText,
      summary,
      error,
      type
    } = req.body;

    const { event } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    if (event) {
      await Job.findByIdAndUpdate(jobId, {
        $push: {
          timeline: { event, timestamp: new Date() }
        }
      });
    }

    const update = {};

    if (error) {
      update.status = "failed";
      update.error = error;
    } else {
      update.status = "completed";
      if (processedUrl) update.processedUrl = processedUrl;
      if (extractedText) update.extractedText = extractedText;
      if (summary) update.summary = summary;
    }

    const job = await Job.findByIdAndUpdate(jobId, update, { new: true });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // auto-enqueue summarization if extractedText is present
    if (extractedText) {
      await fileProcessingQueue.add("ai-summarize", {
        jobId,
        text: extractedText
      });
    }

    // email notification
    if (!error && job.user) {
      const user = await User.findById(job.user);
      if (user?.email) {
        await sendJobCompletedEmail({
          to: user.email,
          fileUrl: fileUrl || job.fileUrl,
          processedUrl: processedUrl || job.processedUrl,
          summary: summary || job.summary,
          extractedText: extractedText || job.extractedText
        });
      }
    }

    return res.json({
      message: "Webhook processed",
      jobId,
      status: update.status
    });

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Webhook handler crashed" });
  }
};
