// src/middleware/multer.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Create temp directory if it doesn't exist
const uploadPath = path.join(process.cwd(), "public", "temp");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Optional: restrict to image types
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({ storage, fileFilter });

// Accept both avatar and coverImage as file fields
export const userFileUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);
