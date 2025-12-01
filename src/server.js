import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/v1/auth.routes.js";
import projectRoutes from "./routes/v1/project.routes.js";
import taskRoutes from "./routes/v1/task.routes.js";
import { globalLimiter } from "./middlewares/rateLimit.js";
import { assignRequestId } from "./middlewares/requestId.js";
import { logger } from "./utils/logger.js";
import { versionWarning } from "./middlewares/versionWarning.js";


connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(globalLimiter);

app.use(assignRequestId);
app.use("/api/v1", versionWarning);

app.use((req, res, next) => {
  req.startTime = Date.now();
  logger.info(req, "Incoming request");

  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    if (duration > 300) {
      logger.warn(req, "Slow request", { duration });
    } else {
      logger.info(req, "Request completed", { duration });
    }
  });

  next();
});

app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/projects/:projectId/tasks", taskRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
  logger.error(req, err.message, {
    stack: err.stack,
    duration: Date.now() - req.startTime,
  });

  res.status(500).json({
    message: "Something went wrong",
    reqId: req.id,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

export default app;


