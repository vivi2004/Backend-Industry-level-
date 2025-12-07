import mongoose from "mongoose";
const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },

    fileUrl: { type: String, required: true },
    processedUrl: { type: String },
    extractedText: { type: String },
    summary: { type: String },

         timeline: [
      {
        event: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },
    bullJobId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
);
const Job = mongoose.model("Job", jobSchema);

export default Job;
