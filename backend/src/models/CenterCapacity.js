import mongoose from "mongoose";

const intervalSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    startMin: {
      type: Number,
      required: true,
    },
    endMin: {
      type: Number,
      required: true,
    },
    planType: {
      type: String,
      default: "Hourly",
    },
  },
  { _id: false }
);

const centerCapacitySchema = new mongoose.Schema(
  {
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      required: true,
      index: true,
    },
    date: {
      type: String, // ISO date string "YYYY-MM-DD"
      required: true,
      index: true,
    },
    version: {
      type: Number,
      default: 0,
    },
    bookedCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    // Exact active reserved half-open intervals [startMin, endMin) on this date
    intervals: [intervalSchema],
    // Backward-compatible hourly array slots
    slots: {
      type: [Number],
      default: () => new Array(24).fill(0),
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one capacity document per center per date
centerCapacitySchema.index({ center: 1, date: 1 }, { unique: true });

const CenterCapacity = mongoose.model("CenterCapacity", centerCapacitySchema);

export default CenterCapacity;
