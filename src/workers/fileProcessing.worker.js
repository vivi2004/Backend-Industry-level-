import { Worker } from "bullmq";
import Redis from "ioredis";
import axios from "axios";

import OpenAI from "openai";
import axios from "axios";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function downloadBuffer(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data);
}

async function handleAiTextExtraction(job) {
  const { fileUrl, jobId } = job.data;

  // Download image/PDF page from Cloudinary
  const buffer = await downloadBuffer(fileUrl);
  const base64 = buffer.toString("base64");

  // Send to OpenAI Vision
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Extract all readable text from this file.",
          },
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${base64}`,
          },
        ],
      },
    ],
  });

  const extractedText = completion.choices[0].message.content;

  // Send webhook update
  await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
    jobId,
    fileUrl,
    extractedText,
  });

  return extractedText;
}

const connection = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "file-processing",
  async (job) => {
    console.log("Processing job:", job.id, "mongoJobId:", job.data.jobId);

    // Simulate file processing
    await new Promise((res) => setTimeout(res, 3000));

    console.log("Processing complete for:", job.data.fileUrl);
    const processedUrl = job.data.fileUrl + "?processed=true";

    // Send webhook callback to main API
    await axios.post("http://localhost:4000/api/v1/webhooks/file-processed", {
      jobId: job.data.jobId,
      fileUrl: job.data.fileUrl,
      processedUrl,
    });

    return { status: "done" };
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Job failed: ${job.id}`, err);
});
