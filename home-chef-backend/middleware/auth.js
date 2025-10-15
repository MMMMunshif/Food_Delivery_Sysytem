import jwt from "jsonwebtoken";
import User from "../models/user.js"; // make sure file name casing matches exactly

// 🔐 Protect middleware (checks if user is logged in)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

//  Only Admin can access
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Admin access required" });
};

// 👨‍🍳 Only Chef can access
export const chefOnly = (req, res, next) => {
  if (req.user && req.user.role === "chef") {
    return next();
  }
  return res.status(403).json({ message: "Chef access required" });
};

// ✅ Admin OR Chef
export const adminOrChefOnly = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "chef")) {
    return next();
  }
  return res.status(403).json({ message: "Admin or Chef access required" });
};
export const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};


