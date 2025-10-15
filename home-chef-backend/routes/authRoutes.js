// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { getProfile, updateProfile, deleteProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { changePassword } from "../controllers/authController.js";
import { sendEmail } from "../utils/sendEmail.js";


const router = express.Router();

// Register & Login
router.post("/register", registerUser);
router.post("/login", loginUser);

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.delete("/profile", protect, deleteProfile);
router.put("/profile/password", protect, changePassword);

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP in DB (or temporarily in memory for testing)
    console.log("Generated OTP:", otp);

    // Send OTP email
    await sendEmail(
      email,
      "Your Home Chef OTP Verification Code",
      `Your verification code is ${otp}`,
      `<h2>Welcome to Home Chef!</h2>
       <p>Your OTP code is: <b>${otp}</b></p>
       <p>This code is valid for 10 minutes.</p>`
    );

    res.status(200).json({ message: "OTP sent successfully to your email!" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});



export default router;
