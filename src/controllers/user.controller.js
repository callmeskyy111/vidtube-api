import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // Basic validation
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists! 🔴");
  }

  // Get file paths from Multer
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing! 🔴");
  }

  let avatar = null;
  let coverImage = null;

  try {
    avatar = await uploadToCloudinary(avatarLocalPath);
    if (!avatar?.url) {
      throw new Error("Cloudinary did not return avatar URL");
    }

    if (coverLocalPath) {
      coverImage = await uploadToCloudinary(coverLocalPath);
      if (!coverImage?.url) {
        throw new Error("Cloudinary did not return coverImage URL");
      }
    }

    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user.");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(200, createdUser, "User registered successfully ✅")
      );
  } catch (error) {
    console.error("🔴 ERROR creating user:", error);

    if (avatar?.public_id) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage?.public_id) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering user. Images deleted."
    );
  }
});

export { registerUser };
