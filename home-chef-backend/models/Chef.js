import mongoose from "mongoose";

const chefSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ["chef","admin"], default: "chef" },
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Dish" }],
  earnings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Chef", chefSchema);
