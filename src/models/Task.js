import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    title: String,
    status: {
      type: String,
      enum: ["todo", "in_progress", "done"],
      default: "todo",
    },
    dueDate: Date,
    deleteAt: { type: Date, default: null },
    attachments: [
      {
        url: String,
        public_id: String,
        format: String,
        bytes: Number,
      },
    ],
  },

  { timestamps: true },
);
export default mongoose.model("Task", taskSchema);
