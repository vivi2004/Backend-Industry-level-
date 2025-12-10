import Job from "../../models/Job.js";
import { getPagination } from "../../utils/paginate.js";

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const filter =
      req.user.role === "admin" ? { _id: id } : { _id: id, user: req.user.id };

    const job = await Job.findOne(filter);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // format timeline
    const formattedTimeline = (job.timeline || []).map((entry) => {
      const time = new Date(entry.timestamp).toLocaleString();
      let label = "";

      switch (entry.event) {
        case "queued":
          label = "Job queued";
          break;
        case "extraction_started":
          label = "Extraction started";
          break;
        case "extraction_completed":
          label = "Extraction completed";
          break;
        case "summarization_started":
          label = "Summarization started";
          break;
        case "summarization_completed":
          label = "Summarization completed";
          break;
        case "cancelled":
          label = "Job cancelled";
          break;
        default:
          label = entry.event;
      }

      return `${label} at ${time}`;
    });

    const steps = [
      "queued",
      "extraction_started",
      "extraction_completed",
      "summarization_started",
      "summarization_completed",
    ];

    const completedEvents = (job.timeline || [])
      .map((e) => e.event)
      .filter((e) => steps.includes(e));

    const progress = Math.min(
      100,
      Math.round((completedEvents.length / steps.length) * 100)
    );

    return res.json({
      ...job.toObject(),
      timelineFormatted: formattedTimeline,
      progress,
    });
  } catch (err) {
    console.error("getJobById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getJobProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const filter =
      req.user.role === "admin" ? { _id: id } : { _id: id, user: req.user.id };

    const job = await Job.findOne(filter);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const steps = [
      "queued",
      "extraction_started",
      "extraction_completed",
      "summarization_started",
      "summarization_completed",
    ];

    const completedEvents = (job.timeline || [])
      .map((e) => e.event)
      .filter((e) => steps.includes(e));

    const progress = Math.min(
      100,
      Math.round((completedEvents.length / steps.length) * 100)
    );

    const start = job.timeline?.find((e) => e.event === "queued")?.timestamp;
    const end = job.timeline?.find(
      (e) => e.event === "summarization_completed"
    )?.timestamp;

    let etaSeconds = null;

    if (start && !end && progress > 0) {
      const elapsedMs = Date.now() - new Date(start).getTime();
      const estimatedTotalMs = elapsedMs / (progress / 100);
      etaSeconds = Math.max(
        1,
        Math.round((estimatedTotalMs - elapsedMs) / 1000)
      );
    }

    return res.json({
      jobId: job._id,
      status: job.status,
      progress,
      etaSeconds,
      timelineFormatted: job.timeline,
    });
  } catch (err) {
    console.error("getJobProgress error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const streamJobProgress = async (req, res) => {
  try {
    const { id } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent("connected", { message: "SSE stream connected", jobId: id });

    const interval = setInterval(async () => {
      const filter =
        req.user.role === "admin"
          ? { _id: id }
          : { _id: id, user: req.user.id };

      const job = await Job.findOne(filter);
      if (!job) {
        sendEvent("error", { message: "Job not found" });
        clearInterval(interval);
        return res.end();
      }

      if (job.status === "cancelled") {
        sendEvent("cancelled", { message: "Job cancelled" });
        clearInterval(interval);
        return res.end();
      }

      const steps = [
        "queued",
        "extraction_started",
        "extraction_completed",
        "summarization_started",
        "summarization_completed",
      ];

      const completedEvents = (job.timeline || [])
        .map((e) => e.event)
        .filter((e) => steps.includes(e));

      const progress = Math.min(
        100,
        Math.round((completedEvents.length / steps.length) * 100)
      );

      sendEvent("progress", {
        progress,
        status: job.status,
        timeline: job.timeline,
      });

      if (progress === 100 || job.status === "failed") {
        sendEvent("completed", { status: job.status });
        clearInterval(interval);
        return res.end();
      }
    }, 2000);

    req.on("close", () => {
      clearInterval(interval);
      res.end();
    });
  } catch (err) {
    console.error("streamJobProgress error:", err);
    return res.end();
  }
};

export const getJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const baseFilter = req.user.role === "admin" ? {} : { user: req.user.id };
    const filter = status ? { ...baseFilter, status } : baseFilter;

    const [jobs, total] = await Promise.all([
      Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: jobs,
    });
  } catch (err) {
    console.error("getJobs pagination error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const streamJobStatus = async (req, res) => {
  const jobId = req.params.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent("connected", { message: "SSE connected", jobId });

  const interval = setInterval(async () => {
    const filter =
      req.user.role === "admin"
        ? { _id: jobId }
        : { _id: jobId, user: req.user.id };

    const job = await Job.findOne(filter);
    if (!job) {
      sendEvent("error", { message: "Job not found" });
      clearInterval(interval);
      return res.end();
    }

    if (job.status === "cancelled") {
      sendEvent("cancelled", { message: "Job cancelled" });
      clearInterval(interval);
      return res.end();
    }

    const steps = [
      "queued",
      "extraction_started",
      "extraction_completed",
      "summarization_started",
      "summarization_completed",
    ];

    const completedEvents = (job.timeline || [])
      .map((e) => e.event)
      .filter((e) => steps.includes(e));

    const progress = Math.min(
      100,
      Math.round((completedEvents.length / steps.length) * 100)
    );

    sendEvent("update", {
      jobId,
      status: job.status,
      progress,
      timeline: job.timeline,
    });

    if (progress === 100 || job.status === "failed") {
      sendEvent("end", { status: job.status });
      clearInterval(interval);
      return res.end();
    }
  }, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
};

export const cancelJob = async (req, res) => {
  try {
    const { id } = req.params;

    const filter =
      req.user.role === "admin" ? { _id: id } : { _id: id, user: req.user.id };

    const job = await Job.findOne(filter);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status === "completed" || job.status === "failed") {
      return res
        .status(400)
        .json({ message: "Job already finished, cannot cancel" });
    }

    job.status = "cancelled";
    job.timeline.push({
      event: "cancelled",
      timestamp: new Date(),
    });

    await job.save();

    return res.json({ message: "Job cancelled successfully" });
  } catch (err) {
    console.error("cancelJob error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
