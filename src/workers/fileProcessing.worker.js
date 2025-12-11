import dotenv from "dotenv";
dotenv.config();

import { Worker } from "bullmq";
import Redis from "ioredis";
import { OpenAI } from "openai/client.js";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import axios from "axios";

import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

async function checkCancellation(jobId) {
  try {
    const res = await axios.get(
      `http://localhost:4000/api/v1/jobs/${jobId}/should-cancel`,
      {
        headers: { "x-worker-secret": process.env.WORKER_SECRET },
      }
    );

    if (res.data.shouldCancel === true) {
      await axios.post(
        "http://localhost:4000/api/v1/webhooks/file-processed",
        { jobId, event: "job_cancelled" },
        { headers: { "x-worker-secret": process.env.WORKER_SECRET } }
      );
      return true;
    }
  } catch (err) {
    console.error("Cancellation check error:", err.response?.data || err.message);
  }
  return false;
}

async function handleAiTextExtraction(job) {
  const { fileUrl, jobId } = job.data;

  await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
    jobId,
    event: "extraction_started",
  }, {
    headers: { "x-worker-secret": process.env.WORKER_SECRET }
  });

  if (await checkCancellation(jobId)) return { status: "cancelled" };

  // 1. Download file locally
  const downloadPath = path.join("/tmp", `ocr_${Date.now()}.png`);
  fs.mkdirSync("/tmp", { recursive: true });
  const file = fs.createWriteStream(downloadPath);

  const response = await axios({
    url: fileUrl,
    method: "GET",
    responseType: "stream",
  });

  await new Promise((resolve, reject) => {
    response.data.pipe(file);
    file.on("finish", resolve);
    file.on("error", reject);
  });

  // 2. Run Tesseract OCR with progress updates
  let ocrText = "";

  await new Promise((resolve, reject) => {
    Tesseract.recognize(downloadPath, "eng", {
      logger: async (m) => {
        if (m.status.includes("recognizing")) {
          if (await checkCancellation(jobId)) return;

          const progress = Math.round(m.progress * 100);

          try {
            await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
              jobId,
              event: "ocr_progress",
              progress
            }, {
              headers: { "x-worker-secret": process.env.WORKER_SECRET }
            });
          } catch (err) {
            console.error("Failed to send OCR progress:", err.message);
          }
        }
      },
    })
      .then(({ data }) => {
        ocrText = data.text.trim();
        resolve();
      })
      .catch(reject);
  });

  if (!ocrText) {
    throw new Error("No text extracted by Tesseract");
  }

  await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
    jobId,
    event: "extraction_completed",
    data: { extractedText: ocrText },
  }, {
    headers: { "x-worker-secret": process.env.WORKER_SECRET }
  });

  // 3. Trigger summarization job
  await axios.post("http://localhost:4000/api/v1/ai/summarize", {
    jobId,
    text: ocrText,
  }, {
    headers: { "x-worker-secret": process.env.WORKER_SECRET }
  });

  // Cleanup
  fs.unlink(downloadPath, () => {});

  return ocrText;
}



async function handleAiSummarization(job) { 
  const { text, jobId } = job.data;

  if (!text || text.trim().length === 0) {
    return { status: "no_text" };
  }

  await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
    jobId,
    event: "summarization_started",
  }, {
    headers: { "x-worker-secret": process.env.WORKER_SECRET }
  });

  if (await checkCancellation(jobId)) return { status: "cancelled" };

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    input: `Summarize the following text in 5-7 bullet points:\n\n${text}`
  });

  const summary = response.output_text || "";

  await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
    jobId,
    event: "summarization_completed",
    data: { summary }
  }, {
    headers: { "x-worker-secret": process.env.WORKER_SECRET }
  });

  return summary;
}

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "file-processing",
  async (job) => {
    if (await checkCancellation(job.data.jobId)) {
      console.log("Job cancelled before processing:", job.id);
      return { status: "cancelled" };
    }

    console.log("Processing job:", job.id, "mongoJobId:", job.data.jobId);
     if(job.name === "ai-extract-text") {
      return await handleAiTextExtraction(job);
     }
      if(job.name === "ai-summarization") {
      return await handleAiSummarization(job);
     }
     
    return { status: "noop" };
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});
