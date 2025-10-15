import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "../config/db.js";
import Chef from "../models/Chef.js";
import Dish from "../models/Dish.js";
import bcrypt from "bcryptjs";

const run = async () => {
  await connectDB(process.env.MONGO_URI);

  await Chef.deleteMany({});
  await Dish.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash("password123", salt);

  const admin = await Chef.create({ name: "Admin", email: "admin@homechef.com", password: hashed, role: "admin", verified: true });
  const chef1 = await Chef.create({ name: "Chef A", email: "chefA@homechef.com", password: hashed, verified: true });
  const chef2 = await Chef.create({ name: "Chef B", email: "chefB@homechef.com", password: hashed });

  const dish1 = await Dish.create({ chef: chef1._id, name: "Rice & Curry", description: "Home style", price: 150, quantity: 20 });
  const dish2 = await Dish.create({ chef: chef1._id, name: "Fish Curry", description: "Spicy", price: 250, quantity: 10 });
  const dish3 = await Dish.create({ chef: chef2._id, name: "Vegetable Stir Fry", price: 120, quantity: 15 });

  chef1.menu.push(dish1._id, dish2._id);
  chef2.menu.push(dish3._id);
  await chef1.save();
  await chef2.save();

  console.log("Seed done");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
