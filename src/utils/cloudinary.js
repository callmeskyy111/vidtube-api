// src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) return null;

    const resp = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("✅ File Uploaded to Cloudinary:", resp.url);

    fs.unlinkSync(localFilePath); // delete file after upload
    return resp;
  } catch (err) {
    console.log("🔴 Upload error:", err);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); // delete even on failure
    }
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("✅ Deleted from Cloudinary:", publicId);
    return result;
  } catch (error) {
    console.log("🔴 Error deleting from Cloudinary:", error);
  }
};
