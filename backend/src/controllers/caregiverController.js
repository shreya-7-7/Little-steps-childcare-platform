import { v2 as cloudinary } from "cloudinary";
import Caregiver from "../models/Caregiver.js";
import Center from "../models/Center.js";
import Provider from "../models/Provider.js";

// ===============================
// CREATE CAREGIVER (Provider)
// ===============================

const createCaregiver = async (req, res) => {
  try {
    // ===============================
    // Request Body
    // ===============================
    const { center, fullName, qualification, experience, specialization, bio, certifications } =
      req.body;

    // ===============================
    // Validation
    // ===============================
    if (!center || !fullName || !qualification || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // ===============================
    // Find Provider
    // ===============================
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // ===============================
    // Find Selected Center
    // ===============================
    const selectedCenter = await Center.findOne({
      _id: center,
      provider: provider._id,
    });

    if (!selectedCenter) {
      return res.status(404).json({
        success: false,
        message: "Selected center not found",
      });
    }

    // ===============================
    // Image
    // ===============================
    let profileImage = {
      url: "",
      public_id: "",
    };

    if (req.file) {
      profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    // ===============================
    // Create Caregiver
    // ===============================
    let parsedCertifications = [];
    if (Array.isArray(certifications)) {
      parsedCertifications = certifications;
    } else if (typeof certifications === "string") {
      try {
        parsedCertifications = JSON.parse(certifications);
      } catch {
        parsedCertifications = certifications.split(",").map((c) => c.trim()).filter(Boolean);
      }
    }

    const caregiver = await Caregiver.create({
      center: selectedCenter._id,
      fullName,
      qualification,
      experience,
      specialization: specialization || "",
      bio: bio || "",
      certifications: parsedCertifications,
      profileImage,
    });

    return res.status(201).json({
      success: true,
      message: "Caregiver created successfully",
      caregiver,
    });
  } catch (error) {
    console.log("CREATE CAREGIVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ===============================
// GET ALL CAREGIVERS (Public)
// ===============================
const getCaregivers = async (req, res) => {
  try {
    const { center } = req.query;

    const filter = {};

    if (center) {
      filter.center = center;
    }

    const caregivers = await Caregiver.find(filter)
      .populate({
        path: "center",
        select: "centerName city slug",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: caregivers.length,
      caregivers,
    });
  } catch (error) {
    console.log("GET CAREGIVERS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ===============================
// GET PROVIDER CAREGIVERS
// ===============================
const getProviderCaregivers = async (req, res) => {
  try {
    // Find Provider
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    // Find All Centers
    const centers = await Center.find({
      provider: provider._id,
    });

    if (!centers.length) {
      return res.status(200).json({
        success: true,
        totalCaregivers: 0,
        caregivers: [],
      });
    }

    // Extract Center IDs
    const centerIds = centers.map((center) => center._id);

    // Find Caregivers
    const caregivers = await Caregiver.find({
      center: { $in: centerIds },
    })
      .populate({
        path: "center",
        select: "centerName city slug",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: caregivers.length,
      caregivers,
    });
  } catch (error) {
    console.error("GET PROVIDER CAREGIVERS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET SINGLE CAREGIVER
// ===============================
const getSingleCaregiver = async (req, res) => {
  try {
    const rawId = req.params.id ? req.params.id.trim() : "";

    if (!rawId || !/^[0-9a-fA-F]{24}$/.test(rawId)) {
      return res.status(404).json({
        success: false,
        message: "Caregiver not found",
      });
    }

    const caregiver = await Caregiver.findById(rawId).populate({
      path: "center",
      select: "centerName city slug address state",
    });

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: "Caregiver not found",
      });
    }

    return res.status(200).json({
      success: true,
      caregiver,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// UPDATE CAREGIVER
// ===============================
const updateCaregiver = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.params.id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: "Caregiver not found",
      });
    }

    // Authorization: provider can only update caregivers belonging to their centers
    if (req.user?.role !== "admin") {
      const provider = await Provider.findOne({ user: req.user._id });
      if (!provider) {
        return res.status(403).json({
          success: false,
          message: "Provider profile not found",
        });
      }
      const center = await Center.findOne({
        _id: caregiver.center,
        provider: provider._id,
      });
      if (!center) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this caregiver",
        });
      }
    }

    const updatedData = {
      ...req.body,
    };

    if (req.file) {
      if (caregiver.profileImage?.public_id) {
        await cloudinary.uploader.destroy(caregiver.profileImage.public_id);
      }

      updatedData.profileImage = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    const updatedCaregiver = await Caregiver.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Caregiver updated successfully",
      caregiver: updatedCaregiver,
    });
  } catch (error) {
    console.log("UPDATE CAREGIVER ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// DELETE CAREGIVER
// ===============================

// ===============================
// DELETE CAREGIVER
// ===============================
const deleteCaregiver = async (req, res) => {
  try {
    const { id } = req.params;

    // Find Caregiver
    const caregiver = await Caregiver.findById(id);

    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: "Caregiver not found",
      });
    }

    // Authorization: provider can only delete caregivers belonging to their centers
    if (req.user?.role !== "admin") {
      const provider = await Provider.findOne({ user: req.user._id });
      if (!provider) {
        return res.status(403).json({
          success: false,
          message: "Provider profile not found",
        });
      }
      const center = await Center.findOne({
        _id: caregiver.center,
        provider: provider._id,
      });
      if (!center) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this caregiver",
        });
      }
    }

    // Delete Image from Cloudinary (if exists)
    if (caregiver.profileImage?.public_id) {
      await cloudinary.uploader.destroy(caregiver.profileImage.public_id);
    }

    // Delete Caregiver
    await caregiver.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Caregiver deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CAREGIVER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete caregiver",
      error: error.message,
    });
  }
};
export {
  createCaregiver,
  getCaregivers,
  getProviderCaregivers,
  getSingleCaregiver,
  updateCaregiver,
  deleteCaregiver,
};
