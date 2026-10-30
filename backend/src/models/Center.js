import { validateWeeklySchedule } from "../utils/scheduleHelper.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

const dayScheduleSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: true },
    is24Hours: { type: Boolean, default: false },
    intervals: [
      {
        open: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        close: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        isOvernight: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { _id: false },
);

const weeklyScheduleSchema = new mongoose.Schema(
  {
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
    sunday: dayScheduleSchema,
  },
  { _id: false },
);

const centerSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      unique: true,
    },

    centerName: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    ageGroup: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    monthlyFee: {
      type: Number,
      required: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    openingTime: {
      type: String,
      required: true,
    },

    closingTime: {
      type: String,
      required: true,
    },

    is24Hours: {
      type: Boolean,
      default: false,
    },
    weeklySchedule: {
      type: weeklyScheduleSchema,
      default: undefined,
      validate: {
        validator: function (v) {
          if (!v) return true;
          const raw = typeof v?.toObject === "function" ? v.toObject() : v;
          const res = validateWeeklySchedule(raw);
          return res.isValid;
        },
        message: function (props) {
          const raw =
            typeof props?.value?.toObject === "function"
              ? props.value.toObject()
              : props?.value;
          const res = validateWeeklySchedule(raw);
          return res.message || "Invalid weekly schedule configuration.";
        },
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    facilities: [
      {
        type: String,
      },
    ],

    thumbnail: {
      url: String,
      public_id: String,
    },

    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
      latitude: Number,

      longitude: Number,
    },

    centerImages: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Delete Cloudinary images before deleting the center
centerSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      if (this.centerImages?.length) {
        for (const image of this.centerImages) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  },
);

centerSchema.index({ "location.coordinates": "2dsphere" }, { sparse: true });

const Center = mongoose.model("Center", centerSchema);

export default Center;
