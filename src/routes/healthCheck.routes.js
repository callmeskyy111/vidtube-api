import { Router } from "express";
import { healthCheck } from "../controllers/healthCheck.controller.js";

const healthCheckRouter = Router();

healthCheckRouter.get("/health-check", healthCheck);

export default healthCheckRouter;
