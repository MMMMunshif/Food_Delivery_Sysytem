import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut, Package, User, Edit2, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders"); // "profile" | "orders" | "manage"
  const [orders, setOrders] = useState([]);
  const [originalOrders, setOriginalOrders] = useState([]); // Store original for cancel
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editOrderId, setEditOrderId] = useState(null);

  // Fetch profile + orders
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [ordersRes, profileRes] = await Promise.all([
          axios.get("http://localhost:5000/api/orders/myorders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setOrders(ordersRes.data);
        setOriginalOrders(ordersRes.data); // Save original copy for cancel
        setProfile(profileRes.data);
      } catch (err) {
        console.error("Error fetching data:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Generate PDF report
  const generatePDF = () => {
    if (orders.length === 0) {
      alert("No orders to generate report.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Home Chef - Order History", 14, 22);

    const now = new Date();
    doc.setFontSize(11);
    doc.text(`Report Generated At: ${now.toLocaleString()}`, 14, 30);

    const tableColumn = ["Date & Time", "Dish Name", "Quantity", "Price (Rs.)", "Delivery Address", "Status"];
    const tableRows = [];
    let totalAmount = 0;

    orders.forEach(order => {
      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A";
      const orderData = [
        orderDate,
        order.dish?.name || "Dish",
        order.quantity,
        order.totalPrice,
        order.deliveryAddress,
        order.status || "Pending"
      ];
      tableRows.push(orderData);
      totalAmount += order.totalPrice || 0;
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 36,
      theme: "grid",
      headStyles: { fillColor: [255, 102, 0], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 12 },
      foot: [["", "", "", "Total", totalAmount, ""]],
      footStyles: { fillColor: [255, 153, 51], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    doc.save("order-history.pdf");
  };

  const saveEditOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      const orderToEdit = orders.find(o => o._id === editOrderId);
      await axios.put(
        `http://localhost:5000/api/orders/${editOrderId}`,
        { quantity: orderToEdit.quantity, deliveryAddress: orderToEdit.deliveryAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Order updated successfully");
      setEditOrderId(null);
      setOriginalOrders(orders); // Update original after saving
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter(o => o._id !== orderId));
      setOriginalOrders(originalOrders.filter(o => o._id !== orderId)); // Update original as well
      alert("Order cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-2">
          <User size={32} /> Customer Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 font-medium ${
            activeTab === "orders"
              ? "border-b-4 border-orange-500 text-orange-600"
              : "text-gray-600 hover:text-orange-600"
          }`}
        >
          My Orders
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium ${
            activeTab === "profile"
              ? "border-b-4 border-orange-500 text-orange-600"
              : "text-gray-600 hover:text-orange-600"
          }`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 font-medium ${
            activeTab === "manage"
              ? "border-b-4 border-orange-500 text-orange-600"
              : "text-gray-600 hover:text-orange-600"
          }`}
        >
          Manage Orders
        </button>
      </div>

      {/* Content */}
      {activeTab === "orders" ? (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={generatePDF}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow"
            >
              Download PDF
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-gray-600">You have no orders yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white p-6 rounded-xl shadow-md border">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {order.dish?.name || "Dish"}
                  </h2>
                  <p className="text-gray-600 mb-2">Qty: {order.quantity}</p>
                  <p className="text-gray-600 mb-2">Price: Rs. {order.totalPrice}</p>
                  <p className="text-gray-600 mb-2">
                    <strong>Delivery:</strong> {order.deliveryAddress}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Picked Up"
                        ? "bg-blue-100 text-blue-700"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "profile" ? (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">My Profile</h2>
          {profile && !editMode ? (
            <div>
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Email:</strong> {profile.email}</p>
              <p><strong>Role:</strong> {profile.role}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate("/change-password")}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                >
                  Change Password
                </button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    await axios.delete("http://localhost:5000/api/auth/profile", {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    alert("Account deleted");
                    localStorage.clear();
                    navigate("/register");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete Account
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const token = localStorage.getItem("token");
                await axios.put(
                  "http://localhost:5000/api/auth/profile",
                  { name: profile.name, email: profile.email },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                alert("Profile updated");
                setEditMode(false);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={profile?.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="email"
                value={profile?.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        // --- Manage Orders Tab ---
        <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
            <Package size={20} /> Manage Orders (Pending Only)
          </h2>

          {orders.filter((order) => order.status === "Pending").length === 0 ? (
            <p className="text-gray-600">No pending orders to manage.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {orders
                .filter((order) => order.status === "Pending")
                .map((order) => (
                  <div key={order._id} className="p-4 border rounded shadow-md flex justify-between items-center">
                    <div>
                      {editOrderId === order._id ? (
                        <div className="space-y-2">
                          <input
                            type="number"
                            min="1"
                            value={order.quantity}
                            onChange={(e) =>
                              setOrders(
                                orders.map((o) =>
                                  o._id === order._id ? { ...o, quantity: parseInt(e.target.value) } : o
                                )
                              )
                            }
                            className="border p-2 w-full rounded"
                          />
                          <input
                            type="text"
                            value={order.deliveryAddress}
                            onChange={(e) =>
                              setOrders(
                                orders.map((o) =>
                                  o._id === order._id ? { ...o, deliveryAddress: e.target.value } : o
                                )
                              )
                            }
                            className="border p-2 w-full rounded"
                          />
                        </div>
                      ) : (
                        <div>
                          <p><strong>Dish:</strong> {order.dish?.name || order.dish}</p>
                          <p><strong>Qty:</strong> {order.quantity}</p>
                          <p><strong>Address:</strong> {order.deliveryAddress}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {editOrderId === order._id ? (
                        <>
                          <button
                            onClick={saveEditOrder}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              // Cancel edit and revert to originalOrders
                              const originalOrder = originalOrders.find(o => o._id === order._id);
                              setOrders(
                                orders.map(o => (o._id === order._id ? originalOrder : o))
                              );
                              setEditOrderId(null);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setEditOrderId(order._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
