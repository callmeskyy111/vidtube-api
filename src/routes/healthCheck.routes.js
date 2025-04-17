import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controller.js";
//import { upload } from "../middlewares/multer.middleware.js";

const healthCheckRouter = Router();

//healthCheckRouter.get("/health-check", upload.single("avatar"), healthCheck);
healthCheckRouter.get("/health-check", healthCheck);

export default healthCheckRouter;
