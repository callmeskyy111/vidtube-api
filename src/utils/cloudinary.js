import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const resp = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File Uploaded On Cloudinary ✅. File src: ", resp.url);
    //Once the file is uploaded, we'd like to delete it from our server
    fs.unlinkSync(localFilePath);
    return resp;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};
