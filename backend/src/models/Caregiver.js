import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const caregiverSchema = new mongoose.Schema(
  {
    center: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Center",
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    specialization: {
      type: String,
      default: "",
      trim: true,
    },

    profileImage: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Delete Cloudinary image before deleting caregiver
caregiverSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    if (this.profileImage?.public_id) {
      await cloudinary.uploader.destroy(this.profileImage.public_id);
    }
  },
);

const Caregiver = mongoose.model("Caregiver", caregiverSchema);

export default Caregiver;
