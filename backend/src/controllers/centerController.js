import { validateWeeklySchedule, getEffectiveWeeklySchedule } from "../utils/scheduleHelper.js";
import Center from "../models/Center.js";
import Provider from "../models/Provider.js";
import User from "../models/User.js";
import generateSlug from "../utils/generateSlug.js";
import cloudinary from "../config/cloudinary.js";

const createCenter = async (req, res) => {
  try {
    // ==========================================
    // Find Provider
    // ==========================================
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    console.log("\nProvider:");
    console.dir(provider, { depth: null });

    if (!provider) {
      console.log("❌ Provider profile not found");

      return res.status(404).json({
        success: false,
        message: "Provider profile not found.",
      });
    }

    console.log("Provider Verification Status:", provider.verificationStatus);

    // Check if provider already has a center
    const existingCenter = await Center.findOne({
      provider: provider._id,
    });

    if (existingCenter) {
      return res.status(400).json({
        success: false,
        message: "You have already created a daycare center.",
      });
    }
    const {
      centerName,
      description,
      address,
      city,
      state,
      pincode,
      ageGroup,
      capacity,
      monthlyFee,
      pricePerDay,
      openingTime,
      closingTime,
      is24Hours,
      facilities,
      latitude,
      longitude,
      isFeatured,
      status,
      weeklySchedule,
    } = req.body;

    console.log("\nExtracted Request Data:");
    console.table({
      centerName,
      description,
      address,
      city,
      state,
      pincode,
      ageGroup,
      capacity,
      monthlyFee,
      pricePerDay,
      openingTime,
      closingTime,
      is24Hours,
      facilities,
      latitude,
      longitude,
      isFeatured,
      status,
    });

    // ==========================================
    // Validation
    // ==========================================
    const is24HoursBool = is24Hours === "true" || is24Hours === true;
    let finalOpeningTime = openingTime;
    let finalClosingTime = closingTime;

    if (is24HoursBool && (!finalOpeningTime || !finalClosingTime)) {
      finalOpeningTime = finalOpeningTime || "00:00";
      finalClosingTime = finalClosingTime || "23:59";
    }

    if (
      !centerName ||
      !description ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !ageGroup ||
      !capacity ||
      !monthlyFee ||
      !pricePerDay ||
      !finalOpeningTime ||
      !finalClosingTime
    ) {
      console.log("❌ Validation Failed");

      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // ==========================================
    // Generate Slug
    // ==========================================
    const slug = generateSlug(centerName);

    console.log("\nGenerated Slug:", slug);

    // ==========================================
    // Check Duplicate Slug
    // ==========================================
    const existingSlug = await Center.findOne({ slug });

    if (existingSlug) {
      console.log("❌ Slug already exists");

      return res.status(409).json({
        success: false,
        message: "A center with this name already exists.",
      });
    }

    // ==========================================
    // Process Images
    // ==========================================
    const centerImages =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

    console.log("\nProcessed Images:");
    console.dir(centerImages, { depth: null });

    // ==========================================
    // Parse Facilities
    // ==========================================
    const parsedFacilities = facilities
      ? Array.isArray(facilities)
        ? facilities
        : JSON.parse(facilities)
      : [];

    console.log("\nParsed Facilities:");
    console.dir(parsedFacilities, { depth: null });

    // ==========================================
    // Validate Weekly Schedule (if provided)
    // ==========================================
    let normalizedWeeklySchedule = undefined;
    if (weeklySchedule !== undefined && weeklySchedule !== null && weeklySchedule !== "") {
      let scheduleObj = weeklySchedule;
      if (typeof scheduleObj === "string") {
        try {
          scheduleObj = JSON.parse(scheduleObj);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid weeklySchedule JSON format.",
          });
        }
      }

      const scheduleValidation = validateWeeklySchedule(scheduleObj);
      if (!scheduleValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: scheduleValidation.message,
        });
      }
      normalizedWeeklySchedule = scheduleValidation.normalizedSchedule;
    }

    // ==========================================
    // Create Center Payload
    // ==========================================
    const centerData = {
      provider: provider._id,
      centerName,
      slug,
      description,
      address,
      city,
      state,
      pincode,
      ageGroup,
      capacity: Number(capacity),
      monthlyFee: Number(monthlyFee),
      pricePerDay: Number(pricePerDay),
      openingTime: finalOpeningTime,
      closingTime: finalClosingTime,
      is24Hours: is24HoursBool,
      facilities: parsedFacilities,
      location: {
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      },
      isFeatured: isFeatured === "true" || isFeatured === true,
      status: status || "active",
      centerImages,
      ...(normalizedWeeklySchedule ? { weeklySchedule: normalizedWeeklySchedule } : {}),
    };

    console.log("\nCenter Payload:");
    console.dir(centerData, { depth: null });

    // ==========================================
    // Save Center
    // ==========================================
    const center = await Center.create(centerData);

    console.log("\n✅ Center Created Successfully");
    console.dir(center, { depth: null });

    return res.status(201).json({
      success: true,
      message: "Center created successfully.",
      center,
    });
  } catch (error) {
    console.log("\n========== CREATE CENTER ERROR ==========");

    console.log("Error Name:", error.name);
    console.log("Error Message:", error.message);

    if (error.code) {
      console.log("Error Code:", error.code);
    }

    if (error.errors) {
      console.log("\nValidation Errors:");
      console.dir(error.errors, { depth: null });
    }

    console.log("\nStack Trace:");
    console.log(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Haversine formula to compute distance in km
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// ===============================
// GET ALL CENTERS (Public) with Proximity & Discovery Filters
// ===============================
const getCenters = async (req, res) => {
  try {
    const {
      city,
      state,
      ageGroup,
      is24Hours,
      shift,
      maxPrice,
      emergencyCare,
      search,
      lat,
      lng,
      radius,
    } = req.query;

    const filter = {
      status: "active",
    };

    if (city) {
      filter.city = { $regex: new RegExp("^" + city + "$", "i") };
    }

    if (state) {
      filter.state = { $regex: new RegExp("^" + state + "$", "i") };
    }

    if (ageGroup && ageGroup !== "all") {
      filter.ageGroup = ageGroup;
    }

    if (is24Hours === "true" || is24Hours === true) {
      filter.is24Hours = true;
    }

    if (shift === "overnight" || shift === "night") {
      filter.$or = [
        { is24Hours: true },
        { $expr: { $gt: ["$openingTime", "$closingTime"] } },
      ];
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter.monthlyFee = { $lte: Number(maxPrice) };
    }

    if (emergencyCare === "true" || emergencyCare === true) {
      filter.facilities = { $regex: /emergency/i };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { centerName: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
        { address: searchRegex },
      ];
    }

    let centers = await Center.find(filter)
      .populate({
        path: "provider",
        select: "-governmentId",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({
        createdAt: -1,
      })
      .lean();

    let isNearbySearch = false;
    let userLocation = null;
    let radiusKm = null;

    if (lat !== undefined && lng !== undefined && lat !== "" && lng !== "") {
      const userLat = Number(lat);
      const userLng = Number(lng);

      if (
        isNaN(userLat) ||
        isNaN(userLng) ||
        userLat < -90 ||
        userLat > 90 ||
        userLng < -180 ||
        userLng > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude or longitude coordinates.",
        });
      }

      isNearbySearch = true;
      userLocation = { latitude: userLat, longitude: userLng };
      radiusKm = radius ? Number(radius) : 50;

      centers = centers
        .map((center) => {
          const cLat =
            center.location?.latitude ??
            center.latitude ??
            (center.location?.coordinates ? center.location.coordinates[1] : null);
          const cLng =
            center.location?.longitude ??
            center.longitude ??
            (center.location?.coordinates ? center.location.coordinates[0] : null);

          if (
            cLat !== null &&
            cLng !== null &&
            !isNaN(Number(cLat)) &&
            !isNaN(Number(cLng)) &&
            (Number(cLat) !== 0 || Number(cLng) !== 0)
          ) {
            const distance = calculateDistanceKm(
              userLat,
              userLng,
              Number(cLat),
              Number(cLng)
            );
            return {
              ...center,
              distanceKm: distance,
              // Normalize coordinate structure for all consumers
              latitude: Number(cLat),
              longitude: Number(cLng),
              location: {
                ...center.location,
                latitude: Number(cLat),
                longitude: Number(cLng),
              },
            };
          }
          return { ...center, distanceKm: null };
        })
        .filter((center) => {
          return center.distanceKm !== null && center.distanceKm <= radiusKm;
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    res.status(200).json({
      success: true,
      total: centers.length,
      isNearbySearch,
      userLocation,
      radiusKm,
      centers,
    });
  } catch (error) {
    console.error("GET CENTERS ERROR:", error.stack || error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// GET MY CENTERS (Provider) only fetch after login provider center datas.
// ===============================
const getMyCenters = async (req, res) => {
  try {
    console.log("========== GET MY CENTERS ==========");

    console.log("USER:");
    console.dir(req.user, { depth: null });

    const provider = await Provider.findOne({
      user: req.user._id,
    });

    console.log("PROVIDER:");
    console.dir(provider, { depth: null });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const centers = await Center.find({
      provider: provider._id,
    });

    console.log("CENTERS:");
    console.dir(centers, { depth: null });

    return res.status(200).json({
      success: true,
      centers,
    });
  } catch (error) {
    console.log("========== GET MY CENTERS ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCenterById = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }


    res.status(200).json({
      success: true,
      center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSingleCenter = async (req, res) => {
  try {
    const rawParam = req.params.slug
      ? decodeURIComponent(req.params.slug).trim()
      : "";

    if (!rawParam || rawParam === "undefined" || rawParam === "null") {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    let center = null;

    // 1. Try exact slug match
    center = await Center.findOne({
      slug: rawParam,
    }).populate({
      path: "provider",
      select: "-governmentId",
      populate: {
        path: "user",
        select: "name email",
      },
    });

    // 2. Try case-insensitive slug match
    if (!center) {
      const escaped = rawParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      center = await Center.findOne({
        slug: { $regex: new RegExp("^" + escaped + "$", "i") },
      }).populate({
        path: "provider",
        select: "-governmentId",
        populate: {
          path: "user",
          select: "name email",
        },
      });
    }

    // 3. Fallback to ObjectId lookup
    if (!center && /^[0-9a-fA-F]{24}$/.test(rawParam)) {
      center = await Center.findById(rawParam).populate({
        path: "provider",
        select: "-governmentId",
        populate: {
          path: "user",
          select: "name email",
        },
      });
    }

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    res.status(200).json({
      success: true,
      center,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCenter = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider profile not found",
      });
    }

    const center = await Center.findOne({
      _id: req.params.id,
      provider: provider._id,
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    // Protect center ownership and metrics from tampering
    delete req.body.provider;
    delete req.body.rating;
    delete req.body.reviewCount;

    if (req.body.centerName) {
      req.body.slug = generateSlug(req.body.centerName);
    }

    if (req.body.facilities) {
      req.body.facilities = Array.isArray(req.body.facilities)
        ? req.body.facilities
        : JSON.parse(req.body.facilities);
    }

    if (req.body.weeklySchedule) {
      if (typeof req.body.weeklySchedule === "string") {
        try {
          req.body.weeklySchedule = JSON.parse(req.body.weeklySchedule);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid weeklySchedule JSON format.",
          });
        }
      }
      const scheduleValidation = validateWeeklySchedule(req.body.weeklySchedule);
      if (!scheduleValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: scheduleValidation.message,
        });
      }
      req.body.weeklySchedule = scheduleValidation.normalizedSchedule;
    }

    if (req.body.latitude !== undefined || req.body.longitude !== undefined) {
      req.body.location = {
        latitude: req.body.latitude ?? center.location?.latitude ?? null,
        longitude: req.body.longitude ?? center.location?.longitude ?? null,
      };

      delete req.body.latitude;
      delete req.body.longitude;
    }

    if (req.body.isFeatured !== undefined) {
      req.body.isFeatured =
        req.body.isFeatured === "true" || req.body.isFeatured === true;
    }

    if (req.body.is24Hours !== undefined) {
      req.body.is24Hours =
        req.body.is24Hours === "true" || req.body.is24Hours === true;
    }

    if (req.body.openingTime !== undefined && typeof req.body.openingTime === "string") {
      req.body.openingTime = req.body.openingTime.trim();
    }

    if (req.body.closingTime !== undefined && typeof req.body.closingTime === "string") {
      req.body.closingTime = req.body.closingTime.trim();
    }

    if (req.files?.length) {
      // Delete old images
      for (const image of center.centerImages) {
        await cloudinary.uploader.destroy(image.public_id);
      }

      // Save new images
      req.body.centerImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const updatedCenter = await Center.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Center updated successfully",
      center: updatedCenter,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const deleteCenter = async (req, res) => {
//   try {
//     const center = await Center.findById(req.params.id);

//     if (!center) {
//       return res.status(404).json({
//         success: false,
//         message: "Center not found",
//       });
//     }

//     await center.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Center deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const deleteCenter = async (req, res) => {
  try {
    const provider = await Provider.findOne({
      user: req.user._id,
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    const center = await Center.findOne({
      _id: req.params.id,
      provider: provider._id,
    });

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    await Center.findByIdAndDelete(center._id);

    res.status(200).json({
      success: true,
      message: "Center deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getFeaturedCenters = async (req, res) => {
  try {
    let centers = await Center.find({
      status: "active",
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    if (!centers || centers.length === 0) {
      centers = await Center.find({
        status: "active",
      })
        .sort({ rating: -1, createdAt: -1 })
        .limit(6);
    }

    res.status(200).json({
      success: true,
      total: centers.length,
      centers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLatestCenters = async (req, res) => {
  try {
    const centers = await Center.find({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      centers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTopRatedCenters = async (req, res) => {
  try {
    const centers = await Center.find({
      status: "active",
    })
      .sort({
        rating: -1,
        reviewCount: -1,
      })
      .limit(6);

    res.status(200).json({
      success: true,
      centers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSimilarCenters = async (req, res) => {
  try {
    const center = await Center.findById(req.params.id);

    if (!center) {
      return res.status(404).json({
        success: false,
        message: "Center not found",
      });
    }

    const centers = await Center.find({
      _id: { $ne: center._id },
      city: center.city,
      status: "active",
    })
      .sort({ rating: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      total: centers.length,
      centers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCenterFilters = async (req, res) => {
  try {
    const cities = await Center.distinct("city", {
      status: "active",
    });

    const states = await Center.distinct("state", {
      status: "active",
    });

    const ageGroups = await Center.distinct("ageGroup", {
      status: "active",
    });

    res.status(200).json({
      success: true,
      filters: {
        cities,
        states,
        ageGroups,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createCenter,
  getCenters,
  getMyCenters,
  getCenterById,
  getSingleCenter,
  getFeaturedCenters,
  getLatestCenters,
  getTopRatedCenters,
  getSimilarCenters,
  getCenterFilters,
  updateCenter,
  deleteCenter,
};
