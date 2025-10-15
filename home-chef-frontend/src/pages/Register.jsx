import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    otp: "",
  });
  const [step, setStep] = useState(1); // 1 = send OTP, 2 = verify OTP
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // ✅ Validation functions
  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address.";
    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    return newErrors;
  };

  // ✅ Handle input change with live validation
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Send OTP
  const sendOtp = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/otp/send", {
        email: form.email,
      });
      alert("✅ OTP sent to your email!");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP and register
  const verifyOtp = async () => {
    if (!form.otp.trim()) {
      setErrors({ otp: "Please enter the OTP sent to your email." });
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/otp/verify", form);
      alert(" Registration successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-500">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {step === 1 ? "Create Account" : "Verify Email OTP"}
        </h2>

        {step === 1 ? (
          <>
            {/* Name */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full border rounded px-3 py-2 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`w-full border rounded px-3 py-2 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-3">
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full border rounded px-3 py-2 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Role */}
            <div className="mb-4">
              <select
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full border rounded px-3 py-2 border-gray-300"
              >
                <option value="customer">Customer</option>
                <option value="chef">Chef</option>
                <option value="admin">Admin</option>
                <option value="delivery">Delivery Partner</option>
                <option value="community">Community Forum</option>
              </select>
            </div>

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded font-semibold transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-700 mb-2">
              Enter the OTP sent to <strong>{form.email}</strong>.
            </p>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={(e) => handleChange("otp", e.target.value)}
                className={`w-full border rounded px-3 py-2 text-center tracking-widest text-lg ${
                  errors.otp ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.otp && (
                <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
              )}
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="mt-3 w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
