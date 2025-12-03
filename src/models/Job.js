import mongoose from "mongoose";
const jobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },

    fileurl: { type: String, required: true },
    processurl: { type: String },
    extractText: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "queued",
    },
    builJobId: { type: String },
    error: { type: String },
  },
  { timestamps: true },
);
const Job = mongoose.model("Job", jobSchema);

export default Job;
