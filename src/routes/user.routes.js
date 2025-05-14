import { Router } from "express";
import { logoutUser, registerUser } from "../controllers/user.controller.js";
import { userFileUpload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/register", userFileUpload, registerUser);

//secured routes
userRouter.get("/logout", verifyJWT, logoutUser);

export default userRouter;
