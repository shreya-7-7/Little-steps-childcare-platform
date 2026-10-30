import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("========== CLOUDINARY UPLOAD ==========");
    console.log("Original Name:", file.originalname);
    console.log("Mime Type:", file.mimetype);

    return {
      folder: "little-steps",
      resource_type: "image",
      format: file.mimetype.split("/")[1],
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
