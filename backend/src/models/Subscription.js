import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
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

    planType: {
      type: String,
      enum: ["Monthly", "Quarterly", "Yearly"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Pending", "Active", "Expired", "Cancelled"],
      default: "Pending",
    },

    expiryWarningSentAt: {
      type: Date,
      default: null,
    },

    expiredNotificationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
