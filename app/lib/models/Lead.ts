import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  vertical: String,
  status: { type: String, default: "new" },
  agent: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);