import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    razorpayOrderId: {
      type: String,
      required: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },

    subscriptionData: {
      center: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Center",
      },

      planType: String,

      startDate: Date,

      endDate: Date,
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    paymentMethod: {
      type: String,
      default: "Razorpay",
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Database-enforced uniqueness for Razorpay order and successful payment IDs.
// Partial filter expressions ensure full compatibility with existing records
// that may have null or missing identifiers without altering existing documents.
paymentSchema.index(
  { razorpayOrderId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      razorpayOrderId: { $type: "string", $gt: "" },
    },
  },
);

paymentSchema.index(
  { razorpayPaymentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "Success",
      razorpayPaymentId: { $type: "string", $gt: "" },
    },
  },
);

export default mongoose.model("Payment", paymentSchema);
