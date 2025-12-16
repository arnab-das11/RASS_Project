import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto'; 
    if (file.mimetype === 'application/pdf') {
        resourceType = 'raw';
    }

    return {
      folder: 'lms_project',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mkv', 'pdf', 'doc', 'docx', 'ppt', 'txt'], 
    };
  },
});

// --- FIX: EXPLICITLY SET FILE SIZE LIMIT TO 500MB ---
// Note: Cloudinary Free Tier still caps at 100MB, but this stops Multer from complaining.
const upload = multer({ 
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB limit
    fieldSize: 500 * 1024 * 1024 // 500 MB for non-file fields
  }
});

export default upload;