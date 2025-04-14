import mongoose from "mongoose";

export default async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB ☑️");
  } catch (err) {
    console.log("🔴 MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}
