import User from "../../models/User.js";
import { sendJobCompletedEmail } from "../../utils/mailer.js";
import Job from "../../models/Job.js";

export const fileProcessedWebhook = async (req, res) => {
  const { jobId, fileUrl, processedUrl, error } = req.body;
  const update = error
    ? { status: "failed", error }
    : { status: "completed", processedUrl };
  const job = await Job.findByIdAndUpdate(jobId, update, { new: true });

  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (!error && job.user) {
    const user = await User.findById(job.user);
    await sendJobCompletedEmail({
      to: user?.email,
      fileUrl,
      processedUrl,
    });
  }

  res.json({ message: "Webhook received", jobId });
};
