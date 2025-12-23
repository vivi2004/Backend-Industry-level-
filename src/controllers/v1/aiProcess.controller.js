import Job from "../../models/Job.js";
import { fileProcessingQueue } from "../../queues/fileProcessing.queue.js";

export const enqueueAiTextExtraction = async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ message: "fileUrl is required" });
  }

  const jobDoc = await Job.create({
    user: req.user._id,
    type: "ai-extract-text",
    fileUrl,
    status: "queued",
  });

  if (fileProcessingQueue) {
    await fileProcessingQueue.add("ai-extract-text", {
      jobId: jobDoc._id.toString(),
      fileUrl,
    });
  } else {
    console.log("Queue disabled - processing synchronously");
    // In production, you might want to process synchronously or skip
  }


  res.json({
    message: "AI text extraction started",
    jobId: jobDoc._id,
  });
};


export const enqueueAiSummarization = async (req, res) => {
  const { jobId, text } = req.body;

  if (!jobId || !text) {
    return res.status(400).json({ message: "jobId and text are required" });
  }

  // Worker is calling this, so update job status directly
  await Job.findByIdAndUpdate(jobId, {
    status: "summarizing",
    $push: {
      timeline: {
        event: "summarization_queued",
        timestamp: new Date(),
      },
    },
  });

  if (fileProcessingQueue) {
    await fileProcessingQueue.add("ai-summarize", {
      jobId,
      text,
    });
  } else {
    console.log("Queue disabled - summarization skipped in production");
  }

  return res.json({
    message: "AI summarization queued",
    jobId,
  });
};
