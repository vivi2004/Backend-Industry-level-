import Job from "../../models/Job.js";

export const getJobById = async (req, res) => {
  const { id } = req.params;

  const filter =
    req.user.role === "admin" ? { _id: id } : { _id: id, user: req.user.id };
  const job = await Job.findOne(filter);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }
  res.json(job);
};

export const getJobs = async (req, res) => {
  const { status } = req.query;
  const baseFilter = req.user.role === "admin" ? {} : { user: req.user.id };
  const filter = status ? { ...baseFilter, status } : baseFilter;

  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json(jobs);
};
