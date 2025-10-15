import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

export default function Menu() {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  // 🛒 Load existing cart from localStorage
useEffect(() => {
  const savedCart = localStorage.getItem("cartItems");
  if (savedCart) setCart(JSON.parse(savedCart));
}, []);


  // 🔸 Fetch community posts
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/posts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error loading posts:", err));
  }, []);

  // 🔸 Fetch dishes
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dishes");
        setDishes(res.data);
        setFilteredDishes(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dishes:", err);
        setLoading(false);
      }
    };
    fetchDishes();
  }, []);

  // 🔸 Search filter
  useEffect(() => {
    const filtered = dishes.filter((dish) => {
      const name = dish.name || "";
      const description = dish.description || "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase())
      );
    });
    setFilteredDishes(filtered);
  }, [search, dishes]);

  // 🛒 Add to cart
  const addToCart = (dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === dish._id);
      if (existing) {
        return prev.map((item) =>
          item._id === dish._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
return [...prev, { ...dish, dishId: dish._id, quantity: 1 }];
    });
  };

  // 🧮 Update quantity
  const updateQuantity = (id, change) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: Math.max(1, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 🗑️ Remove item
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  // 💳 Proceed to checkout
  const proceedToCheckout = () => {
    if (cart.length === 0) return alert("Your cart is empty!");
   localStorage.setItem("cartItems", JSON.stringify(cart)); // unified key (fix)
     navigate("/order/cart"); // redirect to multi-item checkout mode

  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 flex justify-between items-center shadow-md relative">
        <h1 className="text-2xl font-bold">🍴 Home Chef</h1>
        <ul className="hidden md:flex gap-8 font-medium">
          <li><Link to="/" className="hover:underline">Home</Link></li>
          <li><Link to="/menu" className="hover:underline">Menu</Link></li>
          <li><Link to="/about" className="hover:underline">About</Link></li>
          <li><Link to="/contact" className="hover:underline">Contact</Link></li>
        </ul>

        <div className="flex gap-4 items-center">
          <Link
            to="/customer-dashboard"
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
          >
            Dashboard
          </Link>

          {/* 🛒 Cart Icon */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative bg-white p-2 rounded-full hover:scale-110 transition"
          >
            <ShoppingCart className="text-orange-600 w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Cart Dropdown */}
        {showCart && (
          <div className="absolute top-16 right-4 bg-white shadow-lg rounded-lg w-80 p-4 text-gray-800 z-50">
            <h3 className="text-lg font-bold mb-3">🛒 Your Cart</h3>
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">No items in cart</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center mb-3 border-b pb-2"
                  >
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Rs. {item.price} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="bg-gray-200 px-2 rounded"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="bg-gray-200 px-2 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={proceedToCheckout}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg mt-2 hover:scale-105 transition"
                >
                  Proceed to Checkout
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header
        className="bg-cover bg-center h-64 flex items-center justify-center text-white relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200')",
        }}
      >
        <div className="bg-black bg-opacity-50 px-8 py-6 rounded-lg text-center">
          <h2 className="text-4xl font-bold mb-2 animate-pulse">
            Delicious Dishes Await 🍽️
          </h2>
          <p className="text-lg">Order from talented home chefs near you</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="flex justify-center mt-8 px-4">
        <div className="relative w-full md:w-1/2">
          <svg
            className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-300"
          />
        </div>
      </div>

      {/* Menu Items */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-center text-gray-600">Loading dishes...</p>
        ) : filteredDishes.length === 0 ? (
          <p className="text-center text-gray-600">No dishes found</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
            {filteredDishes.map((dish) => (
              <div
                key={dish._id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg transform hover:scale-105 hover:shadow-2xl transition duration-300 relative group"
              >
                <img
                  src={`http://localhost:5000${dish.images[0]}`}
                  alt={dish.name}
                  className="w-full h-56 object-cover group-hover:brightness-90 transition duration-300"
                />
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">
                      {dish.name}
                    </h4>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                      {dish.description}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-orange-600 font-bold text-lg">
                      Rs. {dish.price}
                    </span>
                    <button
                      onClick={() => addToCart(dish)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-2 rounded-full font-semibold hover:scale-110 hover:shadow-lg transition duration-300"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Community Announcements */}
      <section className="bg-white py-12 mt-12 rounded-xl shadow-lg">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📢 Community Announcements
          </h3>
          {posts.length === 0 ? (
            <p className="text-center text-gray-600">No announcements yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-orange-50 p-6 rounded-xl border-l-4 border-orange-500 shadow-md"
                >
                  {post.image && (
                    <img
                      src={`http://localhost:5000${post.image}`}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                  )}
                  <h4 className="text-xl font-semibold mb-2 text-orange-700">
                    {post.title}
                  </h4>
                  <p className="text-gray-700">{post.content}</p>
                  <p className="text-sm text-gray-500 mt-2">— {post.author}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feedback Section */}
      <section className="bg-orange-50 py-12 mt-12 rounded-xl shadow-inner">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 animate-pulse">
            We value your feedback ❤️
          </h3>
          <p className="text-gray-600 mb-6">
            Tell us about your experience with our dishes and service.
          </p>
          <Link
            to="/feedback"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
          >
            Give Feedback
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xl font-bold text-white mb-4">🍴 Home Chef</h4>
            <p>
              Connecting you with amazing home-cooked meals from chefs in your
              community.
            </p>
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
        <div className="text-center text-gray-500 mt-6">
          © 2025 Home Chef. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
