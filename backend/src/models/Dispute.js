import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Safety",
        "Facility",
        "Staff Behavior",
        "Billing/Pricing",
        "Cancellation/Schedule",
        "Other",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["Open", "UnderReview", "Resolved", "Rejected"],
      default: "Open",
      index: true,
    },
    // Parent-visible resolution note
    resolutionNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    // Strictly confidential internal staff investigation notes (never exposed to parents)
    internalNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    // Backwards-compatible field alias
    adminNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

disputeSchema.index({ parent: 1, createdAt: -1 });
disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ center: 1, createdAt: -1 });

const Dispute = mongoose.model("Dispute", disputeSchema);

export default Dispute;
