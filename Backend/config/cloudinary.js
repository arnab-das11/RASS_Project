import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {

    const isOfficeDoc =
      file.mimetype.includes("word") ||
      file.mimetype.includes("presentation") ||
      file.mimetype.includes("text");

    const fileName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");

    return {
      folder: "lms_project",

      // ⭐ THIS IS THE KEY FIX
      resource_type: isOfficeDoc ? "raw" : "auto",

      public_id: `${fileName}_${Date.now()}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default upload;
