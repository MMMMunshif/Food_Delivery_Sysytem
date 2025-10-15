import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <nav className="fixed w-full bg-black text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-white">🍴 Foodie</h1>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex gap-8 text-lg">
          <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
          <li><Link to="/menu" className="hover:text-gray-300">Menu</Link></li>
          <li><Link to="/about" className="hover:text-gray-300">About</Link></li>
          <li><Link to="/contact" className="hover:text-gray-300">Contact</Link></li>
          <li><Link to="/my-orders" className="hover:text-gray-300">My Orders</Link></li>


          {/* 🆕 Show Add Dish only for chefs */}
          {role === "chef" && (
            <li><Link to="/add-dish" className="hover:text-gray-300">Add Dish</Link></li>
          )}
        </ul>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex gap-4">
          <Link to="/register" className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition">Register</Link>
          <Link to="/login" className="px-4 py-2 border border-white rounded hover:bg-white hover:text-black transition">Login</Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black text-white px-6 py-4 mt-2">
          <Link to="/" className="block py-2 hover:text-gray-300">Home</Link>
          <Link to="/menu" className="block py-2 hover:text-gray-300">Menu</Link>
          <Link to="/about" className="block py-2 hover:text-gray-300">About</Link>
          <Link to="/contact" className="block py-2 hover:text-gray-300">Contact</Link>

          {/* 🆕 Mobile Add Dish link */}
          {role === "chef" && (
            <Link to="/add-dish" className="block py-2 hover:text-gray-300">Add Dish</Link>
          )}

          <Link to="/register" className="block py-2 hover:text-gray-300">Register</Link>
          <Link to="/login" className="block py-2 hover:text-gray-300">Login</Link>
        </div>
      )}
    </nav>
  );
}
