import mongoose from "mongoose";

const PublisherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      default: "Unknown",
    },

    verticals: {
      type: [String],
      default: [],
    },

    totalLeads: {
      type: Number,
      default: 0,
    },

    bufferCalls: {
      type: Number,
      default: 0,
    },

    nonBufferCalls: {
      type: Number,
      default: 0,
    },

    totalCalls: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "paused"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Publisher ||
  mongoose.model("Publisher", PublisherSchema);