import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { userFileUpload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.post("/register", userFileUpload, registerUser);
userRouter.post("/login",);

export default userRouter;
