import nodemailer from "nodemailer";
import User from "../models/user.js"; // your User model
import bcrypt from "bcryptjs";


let otpStore = {}; // temporary in-memory OTP storage (you can later move this to Redis or DB)

// Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // store OTP temporarily (expires in 5 minutes)
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // nodemailer setup (using Gmail example)
 const transporter = nodemailer.createTransport({
  service: "gmail", // simpler than specifying host/port manually
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // your 16-digit App Password
  },
});

    const mailOptions = {
      from: `"Home Chef" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code for Home Chef Registration",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP and Create Account
export const verifyOTP = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!otpStore[email]) {
      return res.status(400).json({ message: "No OTP request found for this email" });
    }

    const { otp: storedOtp, expires } = otpStore[email];

    if (Date.now() > expires) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (Number(otp) !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    // delete OTP after verification
    delete otpStore[email];

    res.json({ message: "Registration successful", user: newUser });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};
