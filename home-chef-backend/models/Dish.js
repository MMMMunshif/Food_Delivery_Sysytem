import mongoose from "mongoose";

const dishSchema = new mongoose.Schema({
  chef: { type: mongoose.Schema.Types.ObjectId, ref: "Chef", required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Dish", dishSchema);
