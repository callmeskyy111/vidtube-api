import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    //todo: Validation, for user.
    if (!user) {
      throw new ApiError(404, "Invalid User! 🔴");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("🔴 ERROR: ", error);
    throw new ApiError(
      500,
      "🔴 Something went wrong while generating access/refresh token!"
    );
  }
};

// register-controller
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

//login-controller
const loginUser = asyncHandler(async (req, res) => {
  // get data from the body
  const { email, username, password } = req.password;

  //validation - flexible
  if (!email || !username || !password) {
    throw new ApiError(400, "All fields are required! 🔴");
  }

  // Check if user already exists
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found! 🔴");
  }

  // Validate password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials! 🔴");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //extra query, but safer
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //Another check
  if (!loggedInUser) {
    throw new ApiError(404, "User is not logged-in! 🔴");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  //Send logged-in user details
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      //this is better for mobile-apps, no-cookies can be set there (talk to the front-end team)
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged-in successfully ✅"
      )
    );
});

export { registerUser, loginUser };
