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
    
    // Check if it is a Document
    const isRaw = file.mimetype === 'application/pdf' || 
                  file.mimetype.includes('word') || 
                  file.mimetype.includes('text') ||
                  file.mimetype.includes('presentation');

    const fileName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, "_");
    const extension = file.originalname.split('.').pop();

    return {
      folder: 'lms_project',
      // Force 'raw' for PDFs so they act like files, not images
      resource_type: isRaw ? 'raw' : 'auto', 
      public_id: `${fileName}_${Date.now()}.${extension}`,
      use_filename: true, 
      unique_filename: false,
    };
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } 
});

export default upload;