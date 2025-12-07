import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/v1/auth.routes.js";
import projectRoutes from "./routes/v1/project.routes.js";
import taskRoutes from "./routes/v1/task.routes.js";
import { globalLimiter } from "./middlewares/rateLimit.js";
import { assignRequestId } from "./middlewares/requestId.js";
import { logger } from "./utils/logger.js";
import { versionWarning } from "./middlewares/versionWarning.js";
import webhookRoutes from "./routes/v1/webhook.routes.js";
import uploadProcessRoutes from "./routes/v1/uploadProcess.routes.js";
import jobRoutes from "./routes/v1/job.routes.js";
import aiRoutes from "./routes/v1/ai.routes.js";

connectDB();
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://your-frontend.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / curl

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());

app.use(assignRequestId);
app.use("/api/v1", versionWarning);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/upload", uploadProcessRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/ai", aiRoutes);

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

app.use(globalLimiter);

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
