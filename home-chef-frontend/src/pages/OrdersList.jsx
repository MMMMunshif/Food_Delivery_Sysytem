import React, { useEffect, useState } from "react";
import axios from "axios";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this order?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to delete order");
    }
  };

  const handleEdit = async (order) => {
    const newQuantity = prompt("Enter new quantity:", order.quantity);
    const newAddress = prompt("Enter new delivery address:", order.deliveryAddress);

    if (!newQuantity || !newAddress) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/orders/${order._id}`,
        { quantity: newQuantity, deliveryAddress: newAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(orders.map((o) => (o._id === order._id ? res.data : o)));
      alert("Order updated successfully!");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to update order");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading orders...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = (order.status || "Pending").trim().toLowerCase();
            const isPending = status === "pending";
            console.log(order._id, order.status);

            return (
              <div
                key={order._id}
                className="bg-gradient-to-r from-orange-400 to-red-500 p-4 rounded-lg text-white"
              >
                <h2 className="font-bold">{order.customerName}</h2>
                <p>{order.customerEmail}</p>
                <p>Dish: {order.dish?.name || "N/A"}</p>
                <p>Qty: {order.quantity}</p>
                <p>Total: Rs. {order.totalPrice}</p>
                <p>Status: {order.status || "Pending"}</p>

                {/* ✅ Edit/Delete buttons only for Pending */}
                {isPending && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              
            );
          })}
        </div>
      )}
    </div>
    
  );
  
}
