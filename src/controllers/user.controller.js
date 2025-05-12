import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  //getting the data
  const { fullName, email, username, password } = req.body;

  //validation
  if (
    //! HACK to validate all
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required!");
  }
  //Checking existing user
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists! 🔴");
  }

  //getting images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  //validation
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing! 🔴");
  }

  //uploading to cloudinary
  const avatar = await uploadToCloudinary(avatarLocalPath);

  let coverImage = "";
  if (coverLocalPath) {
    coverImage = await uploadToCloudinary(coverImage);
  }

  //Creating a new User
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //Querying the DB (extra safety-check)
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering an user");
  }

  //Now, if everything is ok..
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully ✅"));
});

export { registerUser };
