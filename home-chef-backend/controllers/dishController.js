import Dish from "../models/Dish.js";

// ✅ Create Dish
export const createDish = async (req, res) => {
  try {
    const { name, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const dish = new Dish({
      name,
      price: Number(price),
      images: image ? [image] : [],
      chef: req.user.id,
    });

    await dish.save();
    res.status(201).json(dish);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Get All Dishes
export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find().populate("chef", "email");
    res.json(dishes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Single Dish by ID
export const getDishById = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id).populate("chef", "email");
    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Dish
export const updateDish = async (req, res) => {
  try {
    const { name, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    dish.name = name || dish.name;
    dish.price = price ? Number(price) : dish.price;
    if (image) dish.images = [image];

    await dish.save();
    res.json(dish);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ✅ Delete Dish
export const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    await dish.deleteOne();
    res.json({ message: "Dish removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
