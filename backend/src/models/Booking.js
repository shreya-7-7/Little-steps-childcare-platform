import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      required: true,
    },

    childName: {
      type: String,
      required: true,
      trim: true,
    },

    childAge: {
      type: Number,
      required: true,
      min: 0,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    planType: {
      type: String,
      enum: ["Hourly", "Daily", "Monthly"],
      required: true,
    },

    specialInstructions: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"],
      default: "Pending",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Booking", bookingSchema);
