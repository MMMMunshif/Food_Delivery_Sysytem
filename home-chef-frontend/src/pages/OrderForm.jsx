// src/pages/OrderForm.jsx
import { useState } from "react";
import API from "../api";

export default function OrderForm({ dish, onClose }) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/orders", {
        customerName,
        customerEmail,
        dishId: dish._id,
        quantity,
      });
      setMessage("Order placed successfully!");
    } catch (err) {
      setMessage(" Failed to place order.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Order {dish.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Place Order
          </button>
          {message && <p className="text-sm mt-2">{message}</p>}
        </form>
        <button
          onClick={onClose}
          className="mt-3 w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}
