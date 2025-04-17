import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber: {
      type: mongoose.Schema.Types.ObjectId, // one who's subscribing to a
      ref: "User",
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId, // one to whom the 'subscriber' subscribes to
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
