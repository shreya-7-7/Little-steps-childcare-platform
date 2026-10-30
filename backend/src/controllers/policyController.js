import mongoose from "mongoose";
import Policy from "../models/Policy.js";

const VALID_STATUSES = ["draft", "published"];
const VALID_CATEGORIES = ["Safety", "Terms", "Privacy", "Guidelines", "General"];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ==========================================
// PUBLIC ENDPOINTS (PUBLISHED CONTENT ONLY)
// ==========================================

/**
 * Public: Retrieve all published policies.
 * Strictly filters out drafts and strips internal administrator references.
 */
export const getPublicPolicies = async (req, res) => {
  try {
    const query = { status: "published" };
    if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
      query.category = req.query.category;
    }

    const policies = await Policy.find(query)
      .select("title slug summary category createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("GET PUBLIC POLICIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Public: Retrieve a single published policy by slug.
 * If the policy is draft or missing, returns 404.
 */
export const getPublicPolicyBySlug = async (req, res) => {
  try {
    const slug = req.params.slug ? req.params.slug.trim().toLowerCase() : "";
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Valid policy slug is required.",
      });
    }

    const policy = await Policy.findOne({
      slug,
      status: "published",
    })
      .select("title slug content summary category createdAt updatedAt")
      .lean();

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found or has not been published yet.",
      });
    }

    return res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("GET PUBLIC POLICY BY SLUG ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// ADMIN ENDPOINTS (FULL CRUD & DRAFT ACCESS)
// ==========================================

/**
 * Admin: List all policies, including drafts and revision metadata.
 */
export const getAdminPolicies = async (req, res) => {
  try {
    const query = {};
    if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
      query.status = req.query.status;
    }
    if (req.query.category && VALID_CATEGORIES.includes(req.query.category)) {
      query.category = req.query.category;
    }

    const policies = await Policy.find(query)
      .populate("updatedBy", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: policies.length,
      policies,
    });
  } catch (error) {
    console.error("ADMIN GET POLICIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Get single policy details by ID.
 */
export const getAdminPolicyById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy ID format.",
      });
    }

    const policy = await Policy.findById(req.params.id)
      .populate("updatedBy", "name email")
      .lean();

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    return res.status(200).json({
      success: true,
      policy,
    });
  } catch (error) {
    console.error("ADMIN GET POLICY BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Create a new safety or platform content policy.
 */
export const createPolicy = async (req, res) => {
  try {
    const { title, slug, content, category, status, summary } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Policy title and content are required.",
      });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title must be between 3 and 200 characters.",
      });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Policy content must be at least 10 characters.",
      });
    }

    // Determine slug
    const finalSlug = slug ? slugify(slug) : slugify(trimmedTitle);
    if (!finalSlug) {
      return res.status(400).json({
        success: false,
        message: "Unable to generate a valid lowercase alphanumeric slug.",
      });
    }

    // Check slug collision
    const existingSlug = await Policy.findOne({ slug: finalSlug });
    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: `A policy with the slug "${finalSlug}" already exists.`,
      });
    }

    const finalStatus = status && VALID_STATUSES.includes(status) ? status : "draft";
    const finalCategory = category && VALID_CATEGORIES.includes(category) ? category : "Safety";

    const policy = await Policy.create({
      title: trimmedTitle,
      slug: finalSlug,
      content: trimmedContent,
      category: finalCategory,
      status: finalStatus,
      summary: summary ? summary.trim() : "",
      updatedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Policy created successfully.",
      policy,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A policy with this unique slug already exists.",
      });
    }
    console.error("CREATE POLICY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Update an existing policy.
 */
export const updatePolicy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy ID format.",
      });
    }

    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    const { title, slug, content, category, status, summary } = req.body;

    if (title !== undefined) {
      const trimmedTitle = String(title).trim();
      if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
        return res.status(400).json({
          success: false,
          message: "Title must be between 3 and 200 characters.",
        });
      }
      policy.title = trimmedTitle;
    }

    if (content !== undefined) {
      const trimmedContent = String(content).trim();
      if (trimmedContent.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Content must be at least 10 characters.",
        });
      }
      policy.content = trimmedContent;
    }

    if (slug !== undefined) {
      const newSlug = slugify(slug);
      if (!newSlug) {
        return res.status(400).json({
          success: false,
          message: "Invalid slug provided.",
        });
      }
      if (newSlug !== policy.slug) {
        const slugCollision = await Policy.findOne({
          slug: newSlug,
          _id: { $ne: policy._id },
        });
        if (slugCollision) {
          return res.status(409).json({
            success: false,
            message: `A policy with the slug "${newSlug}" already exists.`,
          });
        }
        policy.slug = newSlug;
      }
    }

    if (category !== undefined && VALID_CATEGORIES.includes(category)) {
      policy.category = category;
    }

    if (status !== undefined && VALID_STATUSES.includes(status)) {
      policy.status = status;
    }

    if (summary !== undefined) {
      policy.summary = String(summary).trim().substring(0, 500);
    }

    policy.updatedBy = req.user._id;

    await policy.save();

    return res.status(200).json({
      success: true,
      message: "Policy updated successfully.",
      policy,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Slug collision: A policy with this slug already exists.",
      });
    }
    console.error("UPDATE POLICY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Toggle publication state (publish/unpublish).
 */
export const togglePolicyPublication = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy ID format.",
      });
    }

    const policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    const targetStatus =
      req.body.status && VALID_STATUSES.includes(req.body.status)
        ? req.body.status
        : policy.status === "published"
          ? "draft"
          : "published";

    policy.status = targetStatus;
    policy.updatedBy = req.user._id;

    await policy.save();

    return res.status(200).json({
      success: true,
      message: `Policy status successfully updated to "${targetStatus}".`,
      policy,
    });
  } catch (error) {
    console.error("TOGGLE POLICY PUBLICATION ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Delete a policy.
 */
export const deletePolicy = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid policy ID format.",
      });
    }

    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Policy deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE POLICY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
