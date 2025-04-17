import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //Cloudinary URL
      required: true,
    },
    coverImg: {
      type: String, //Cloudinary URL
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//Defines a pre hook for the model.
userSchema.pre("save", async function (req, res, next) {
  // if (this.modified("password")) {
  //   this.password = bcrypt.hash(this.password, 10);
  // }
  //! or, smarter move 💡-
  if (!this.modified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next();
});

//Object of currently defined methods on this schema.
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//Whenever a USER logs in, we generate a access-token and a refresh-token (long-term)
//Both are same, but usage is different
userSchema.methods.generateAccessToken = function () {
  //setting short-lived access token
  return jwt.sign(
    {
      _id: this._id,
      email: this.email, //opt.
      username: this.username, //opt.
      fullname: this.fullname, //opt.
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
