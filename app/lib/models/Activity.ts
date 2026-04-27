import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  agentName: String,
  type: {
    type: String,
    enum: ["call", "lead", "transfer", "conversion", "note", "other"],
    required: true,
  },
  vertical: String,
  count: { type: Number, default: 1 },
  note: String,
  date: { type: Date, default: Date.now },
});

export default mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);