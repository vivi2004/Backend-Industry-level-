import { Queue } from "bullmq";
import Redis from "ioredis";

// Skip Redis in production (Render)
const isProduction = process.env.NODE_ENV === "production";

let fileProcessingQueue = null;

if (!isProduction) {
  const connection = new Redis({
    host: "127.0.0.1",
    port: 6379,
  });

  fileProcessingQueue = new Queue("file-processing", {
    connection,
  });
} else {
  console.log("File processing queue disabled in production");
}

export { fileProcessingQueue };
