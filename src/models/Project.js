import mongoose from "mongoose";
const projectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
export default mongoose.model("Project", projectSchema);
