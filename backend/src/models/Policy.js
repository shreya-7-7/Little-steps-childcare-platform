import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must only contain lowercase alphanumeric characters and single hyphens."],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    category: {
      type: String,
      enum: ["Safety", "Terms", "Privacy", "Guidelines", "General"],
      default: "Safety",
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    summary: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

policySchema.index({ status: 1, createdAt: -1 });

const Policy = mongoose.model("Policy", policySchema);

export default Policy;
