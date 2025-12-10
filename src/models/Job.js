import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      required: true,
      enum: ["ai-extract-text", "ai-summarize", "ocr-only"]
    },

    fileUrl: {
      type: String,
      required: true
    },

    processedUrl: {
      type: String
    },

    extractedText: {
      type: String
    },

    ocrTextRaw: {
      type: String
    },

    summary: {
      type: String
    },

    cancelRequested: {
      type: Boolean,
      default: false
    },

    timeline: [
      {
        event: { type: String, required: true },
        message: { type: String },
        progress: { type: Number, min: 0, max: 100 },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed", "cancelled"],
      default: "queued"
    },

    bullJobId: {
      type: String
    },

    error: {
      type: String
    }
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
