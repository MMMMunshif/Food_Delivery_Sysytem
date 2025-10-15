import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const customerEmail = "john@example.com"; // 🔑 replace with logged-in user email later

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders?email=${customerEmail}`)
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerEmail]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (orders.length === 0) return <div className="text-center p-6">No orders found</div>;  

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">My Orders</h2>

      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md flex gap-6">
            <img 
              src={`http://localhost:5000${order.dish.images[0]}`} 
              alt={order.dish.name} 
              className="w-32 h-32 object-cover rounded-md"
            />
            <div>
              <h3 className="text-xl font-semibold">{order.dish.name}</h3>
              <p className="text-gray-600">{order.deliveryAddress}</p>
              <p className="mt-2">Quantity: {order.quantity}</p>
              <p className="text-orange-600 font-bold">Total: Rs. {order.totalPrice}</p>
              <p className="text-sm text-gray-500">Ordered on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
