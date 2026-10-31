import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import connectDB from "../config/db.js";
import Center from "../models/Center.js";
import Caregiver from "../models/Caregiver.js";
import Provider from "../models/Provider.js";

// Specific Target Centre Configuration
const TARGET_CENTER_ID = "6ae481291b7772a09cd87804";
const TARGET_PROVIDER_ID = "6ae481291b7772a09cd87803";
const TARGET_CENTER_NAME = "[DEMO] Little Steps Childcare Centre - Lucknow";
const TARGET_DB_NAME = "little_steps_db";

export const demoCaregivers = [
  {
    fullName: "Priyanka Deshmukh",
    qualification: "M.Ed in Early Childhood Education, Montessori Certified",
    experience: 7,
    specialization: "Infant Care & Sensory Early Learning",
    bio: "Dedicated early educator with 7+ years of experience fostering nurturing, exploratory learning environments for infants and young children.",
    certifications: [
      "Montessori Infant & Toddler Diploma",
      "Pediatric First Aid & CPR",
      "Early Literacy Development",
    ],
    profileImage: {
      url: "/caregivers/caregiver-1.svg",
      public_id: "demo-caregiver-1",
    },
    isAvailable: true,
  },
  {
    fullName: "Aarav Sharma",
    qualification: "B.A. in Child Psychology & Development",
    experience: 5,
    specialization: "Toddler Cognitive & Behavioral Growth",
    bio: "Specializes in emotional resilience and social-readiness through structured sensory play and interactive storytelling.",
    certifications: [
      "Child Behavior Support Certified",
      "First Aid / AED Certified",
      "Creative Arts in Early Education",
    ],
    profileImage: {
      url: "/caregivers/caregiver-2.svg",
      public_id: "demo-caregiver-2",
    },
    isAvailable: true,
  },
  {
    fullName: "Ananya Iyer",
    qualification: "Registered Pediatric Nurse & Child Nutritionist",
    experience: 9,
    specialization: "Health, Safety & Infant Wellness",
    bio: "Combines pediatric healthcare experience with compassionate caregiving, ensuring allergy-safe, hygienic, and health-focused routines.",
    certifications: [
      "Pediatric Advanced Life Support (PALS)",
      "Child Nutrition & Meal Planning",
      "Infant Caregiving Excellence",
    ],
    profileImage: {
      url: "/caregivers/caregiver-3.svg",
      public_id: "demo-caregiver-3",
    },
    isAvailable: true,
  },
  {
    fullName: "Rohit Verma",
    qualification: "B.P.Ed, Certified Motor Skills & Play Instructor",
    experience: 4,
    specialization: "Gross Motor Skills & Exploratory Play",
    bio: "Passionate about building children's physical coordination, confidence, and team play through fun, safe indoor and outdoor activities.",
    certifications: [
      "Youth Physical Activity Instructor",
      "Emergency Medical Responder",
      "Play-Based Learning Certified",
    ],
    profileImage: {
      url: "/caregivers/caregiver-4.svg",
      public_id: "demo-caregiver-4",
    },
    isAvailable: true,
  },
];

export const seedCaregivers = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    // Strict Database Boundary Check
    if (mongoose.connection.name !== TARGET_DB_NAME) {
      throw new Error(
        `SAFETY ABORT: Connected to database '${mongoose.connection.name}'. This operation is strictly restricted to '${TARGET_DB_NAME}'.`,
      );
    }

    // Find ONLY the specified target centre
    const targetCenter = await Center.findOne({
      _id: TARGET_CENTER_ID,
      provider: TARGET_PROVIDER_ID,
    }).populate("provider");

    if (!targetCenter) {
      throw new Error(
        `Target centre '${TARGET_CENTER_NAME}' (ID: ${TARGET_CENTER_ID}, Provider: ${TARGET_PROVIDER_ID}) not found in ${TARGET_DB_NAME}.`,
      );
    }

    console.log(
      `[SEED] Target Centre verified: "${targetCenter.centerName}" (ID: ${targetCenter._id}) with Provider ID: ${targetCenter.provider?._id || targetCenter.provider}`,
    );

    let createdCount = 0;
    let skippedCount = 0;

    for (const item of demoCaregivers) {
      // 1. Explicit pre-insertion check for existing document
      const existing = await Caregiver.findOne({
        fullName: item.fullName,
        center: targetCenter._id,
      });

      if (existing) {
        console.log(
          `[SEED] Caregiver "${item.fullName}" already exists for centre "${targetCenter.centerName}". Skipping (never modified).`,
        );
        skippedCount++;
        continue;
      }

      // 2. Strict Create-Only operation using $setOnInsert (never modifies existing records)
      const caregiverData = {
        ...item,
        center: targetCenter._id,
      };

      const result = await Caregiver.findOneAndUpdate(
        {
          fullName: item.fullName,
          center: targetCenter._id,
        },
        {
          $setOnInsert: caregiverData,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      if (result) {
        console.log(`[SEED] Created caregiver profile: "${item.fullName}"`);
        createdCount++;
      }
    }

    console.log(
      `[SEED] Completed for centre "${targetCenter.centerName}": ${createdCount} created, ${skippedCount} skipped.`,
    );
    return { createdCount, skippedCount, success: true };
  } catch (error) {
    console.error("[SEED ERROR]", error.message);
    throw error;
  }
};

// Direct script execution support
if (process.argv[1] && process.argv[1].endsWith("seedCaregivers.js")) {
  seedCaregivers()
    .then(() => {
      console.log("[SEED] Execution finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[SEED FAILED]", err);
      process.exit(1);
    });
}
