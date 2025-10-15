import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Utensils, Truck, Star } from "lucide-react";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  const bgImages = [
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1600",
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=1600",
    "https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1600"
  ];

  useEffect(() => {
    const bgInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 5000);

    return () => clearInterval(bgInterval);
  }, []);

  if (showSplash) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-bounce">
          Welcome to Home Chef 🍴
        </h1>
        <p className="text-white text-xl md:text-2xl mb-8">Delicious meals, delivered with love!</p>
        
        <button
          onClick={() => setShowSplash(false)}
          className="bg-white text-orange-600 px-8 py-3 rounded-full text-xl font-semibold hover:bg-gray-200 transition"
        >
          Get Started
        </button>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">🍴 Home Chef</h1>
        <ul className="hidden md:flex gap-8 font-medium">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/menu" className="hover:underline">Menu</Link></li>
          <li><Link to="/about" className="hover:underline">About</Link></li>
          <li><Link to="/contact" className="hover:underline">Contact</Link></li>
        </ul>
        <div className="flex gap-4">
          <Link to="/login" className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Login</Link>
          <Link to="/register" className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        className="h-[90vh] relative flex items-center justify-center overflow-hidden transition-all duration-1000"
        style={{
          backgroundImage: `url(${bgImages[bgIndex]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative z-10 text-center px-6">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white">Delicious Home-Cooked Meals 🍲</h2>
          <p className="text-lg md:text-xl mb-6 text-white">
            Order from talented home chefs and enjoy fresh food at your doorstep.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/menu"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:scale-105 transition"
            >
              Explore Menu
            </Link>
            <Link
              to="/register"
              className="bg-white text-orange-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Join as Chef
            </Link>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-10 text-gray-800">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-orange-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <Utensils className="mx-auto text-orange-500" size={48} />
              <h4 className="text-xl font-semibold mt-4">Choose Your Meal</h4>
              <p className="text-gray-600 mt-2">
                Explore a wide variety of dishes made by passionate home chefs.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <Truck className="mx-auto text-orange-500" size={48} />
              <h4 className="text-xl font-semibold mt-4">Fast Delivery</h4>
              <p className="text-gray-600 mt-2">
                Your order will be delivered hot and fresh right to your doorstep.
              </p>
            </div>
            <div className="bg-orange-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <Star className="mx-auto text-orange-500" size={48} />
              <h4 className="text-xl font-semibold mt-4">Enjoy & Rate</h4>
              <p className="text-gray-600 mt-2">
                Taste the food, leave feedback, and help us improve our service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-orange-100 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Why Choose Home Chef?</h3>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            We connect food lovers with talented chefs in your community. Whether you crave traditional meals or want to try something new, our platform ensures you enjoy homemade dishes with love and care. 
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold text-white mb-4">🍴 Home Chef</h4>
            <p>Connecting you with amazing home-cooked meals from chefs in your community.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/menu" className="hover:underline">Menu</Link></li>
              <li><Link to="/about" className="hover:underline">About Us</Link></li>
              <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contact</h4>
            <p>Email: support@homechef.com</p>
            <p>Phone: +94 77 123 4567</p>
          </div>
        </div>
        <div className="text-center text-gray-500 mt-6">© 2025 Home Chef. All rights reserved.</div>
      </footer>
    </div>
  );
}
