import { fileProcessingQueue } from "../../queues/fileProcessing.queue.js";
import Job from "../../models/Job.js";

export const enqueueFileProcessing = async (req, res) => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    return res.status(400).json({ message: "fileUrl is required" });
  }

  // create a  job in th DB
  const jobDoc = await Job.create({
    user: req.user?._id,
    type: "ai-extract-text",
    fileUrl,
    status: "queued",
  });

  if (fileProcessingQueue) {
    const job = await fileProcessingQueue.add("file-processing", {
      fileUrl,
      jobId: jobDoc._id.toString(),
    });

    jobDoc.builJobId = job.id.toString();
    await jobDoc.save();
  } else {
    console.log("Queue disabled - file processing skipped in production");
    jobDoc.status = "failed";
    jobDoc.error = "Queue disabled in production";
    await jobDoc.save();
  }

  res.json({
    message: "File processing started",
    jobId: jobDoc._id,
  });
};
