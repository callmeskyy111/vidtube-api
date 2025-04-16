import express from "express";
export const app = express();
import cors from "cors";
import healthCheckRouter from "./routes/healthCheck.routes.js";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//common middlewares
app.use(express.json({ limit: "25kb" }));
app.use(express.urlencoded({ extended: true, limit: "25kb" }));
app.use(express.static("public"));

//routes
app.use("/api/v1/", healthCheckRouter);
