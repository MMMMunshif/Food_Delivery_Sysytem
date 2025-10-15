  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  import {
    LogOut,
    Truck,
    CheckCircle,
    XCircle,
    Search,
    Download,
    ChevronDown,
    ChevronUp,
  } from "lucide-react";
  import jsPDF from "jspdf";
  import "jspdf-autotable";
  import { io } from "socket.io-client";
  import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } from "recharts";

  export default function DeliveryDashboard() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [search, setSearch] = useState("");
    const [stats, setStats] = useState({
      totalDeliveries: 0,
      totalEarnings: 0,
      weeklyDeliveries: 0,
      weeklyEarnings: 0,
    });

    const [expandedSections, setExpandedSections] = useState({
      pending: true,
      pickedUp: false,
      delivered: false,
    });

    // ✅ Live updates
    useEffect(() => {
      const socket = io("http://localhost:5000");
      socket.on("orderUpdated", () => {
        console.log("📦 Order updated — refreshing dashboard...");
        fetchOrders();
      });
      return () => socket.disconnect();
    }, []);

    // ✅ Fetch Orders
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
        calculateStats(res.data);
      } catch (err) {
        console.error("Error fetching orders:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchOrders();
    }, []);

    // ✅ Calculate stats
    const calculateStats = (ordersData) => {
      const deliveredOrders = ordersData.filter((o) => o.status === "Delivered");

      const totalDeliveries = deliveredOrders.length;
      const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.totalPrice * 0.1, 0);

      const now = new Date();
      const weeklyDelivered = deliveredOrders.filter((o) => {
        const date = new Date(o.updatedAt || o.createdAt);
        return (now - date) / (1000 * 60 * 60 * 24) <= 7;
      });

      const weeklyDeliveries = weeklyDelivered.length;
      const weeklyEarnings = weeklyDelivered.reduce((sum, o) => sum + o.totalPrice * 0.1, 0);

      setStats({
        totalDeliveries,
        totalEarnings: totalEarnings.toFixed(2),
        weeklyDeliveries,
        weeklyEarnings: weeklyEarnings.toFixed(2),
      });
    };

    // ✅ Update Order Status
    const updateStatus = async (orderId, status) => {
      try {
        setUpdatingId(orderId);
        const token = localStorage.getItem("token");

        await axios.put(
          `http://localhost:5000/api/orders/${orderId}/status`,
          { status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        fetchOrders();
      } catch (err) {
        console.error("Update status error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to update order");
      } finally {
        setUpdatingId(null);
      }
    };

    // ✅ Logout
    const handleLogout = () => {
      localStorage.removeItem("token");
      navigate("/login");
    };

    // ✅ Search Filter
    const filteredOrders = orders.filter((o) =>
      [o.customerName, o.customerEmail, o.dish?.name, o.status]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    // ✅ Professional Styled PDF Report
    const downloadReport = () => {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(255, 87, 34);
      doc.text("Delivery Partner Performance Report", 105, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });

      doc.setDrawColor(255, 87, 34);
      doc.line(20, 33, 190, 33);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(13);
      doc.text("Summary", 20, 45);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`• Total Deliveries: ${stats.totalDeliveries}`, 25, 55);
      doc.text(`• Weekly Deliveries: ${stats.weeklyDeliveries}`, 25, 63);
      doc.text(`• Weekly Earnings: Rs. ${stats.weeklyEarnings}`, 25, 71);
      doc.text(`• Total Earnings: Rs. ${stats.totalEarnings}`, 25, 79);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 87, 34);
      doc.text("Order Details", 20, 95);

      const tableData = filteredOrders.map((o, i) => [
        i + 1,
        o.customerName,
        o.dish?.name || "N/A",
        o.quantity,
        `Rs. ${o.totalPrice}`,
        o.status,
      ]);

      doc.autoTable({
        startY: 100,
        head: [["#", "Customer", "Dish", "Qty", "Total", "Status"]],
        body: tableData,
        styles: { fontSize: 10, halign: "center" },
        headStyles: { fillColor: [255, 87, 34], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 15, right: 15 },
      });

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor(130);
      doc.text("© 2025 Home Chef Express | Auto-generated Delivery Report", 105, pageHeight - 10, {
        align: "center",
      });

      doc.save("DeliveryReport.pdf");
    };

    // ✅ Grouped Orders
    const grouped = {
      pending: filteredOrders.filter((o) => o.status === "Pending"),
      pickedUp: filteredOrders.filter((o) => o.status === "Picked Up"),
      delivered: filteredOrders.filter((o) => o.status === "Delivered"),
    };

    const toggleSection = (section) => {
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    // ✅ UI
    if (loading) return <div className="p-6 text-center">Loading orders...</div>;

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600 flex items-center gap-2">
            <Truck size={32} /> Delivery Partner Dashboard
          </h1>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 border rounded"
              />
              <Search size={16} className="absolute left-2 top-3 text-gray-500" />
            </div>
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              <Download size={16} /> Download Report
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Deliveries</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalDeliveries}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700">Weekly Deliveries</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.weeklyDeliveries}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700">Weekly Earnings</h2>
            <p className="text-3xl font-bold text-orange-600 mt-2">Rs. {stats.weeklyEarnings}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-700">Total Earnings</h2>
            <p className="text-3xl font-bold text-purple-600 mt-2">Rs. {stats.totalEarnings}</p>
          </div>
        </div>

        {/* Orders Section */}
        {Object.entries(grouped).map(([key, list]) => (
          <div key={key} className="mb-6">
            <div
              className={`flex justify-between items-center px-4 py-3 rounded-t-lg cursor-pointer ${
                key === "pending"
                  ? "bg-yellow-500"
                  : key === "pickedUp"
                  ? "bg-blue-500"
                  : "bg-green-600"
              } text-white`}
              onClick={() => toggleSection(key)}
            >
              <h2 className="text-lg font-semibold">
                {key === "pending"
                  ? "🕓 Pending Orders"
                  : key === "pickedUp"
                  ? "🚚 Picked Up Orders"
                  : "✅ Delivered Orders"}{" "}
                ({list.length})
              </h2>
              {expandedSections[key] ? <ChevronUp /> : <ChevronDown />}
            </div>

            {expandedSections[key] && (
              <div className="bg-white p-4 rounded-b-lg shadow grid md:grid-cols-2 gap-6">
                {list.length === 0 ? (
                  <p className="text-gray-500 italic">No orders in this category.</p>
                ) : (
                  list.map((order) => (
                    <div key={order._id} className="p-4 border rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {order.customerName}
                      </h3>
                      <p className="text-gray-600 text-sm">{order.customerEmail}</p>
                      <p className="mt-2">
                        <strong>Dish:</strong> {order.dish?.name || "N/A"} (x{order.quantity})
                      </p>
                      <p>
                        <strong>Total:</strong> Rs. {order.totalPrice}
                      </p>
                      <p>
                        <strong>Address:</strong> {order.deliveryAddress}
                      </p>
                      <p className="mt-1">
                        <strong>Status:</strong>{" "}
                        <span className="font-bold text-blue-600">{order.status}</span>
                      </p>

                      {key !== "delivered" && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => updateStatus(order._id, "Picked Up")}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Picked Up
                          </button>
                          <button
                            onClick={() => updateStatus(order._id, "Delivered")}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Delivered
                          </button>
                          <button
                            onClick={() => updateStatus(order._id, "Cancelled")}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        {/* 📊 Delivery Performance Chart */}
        <div className="mt-10 bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📈 Weekly Delivery Performance
          </h2>
          <p className="text-gray-500 mb-2">
            Visual summary of your weekly deliveries and earnings.
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={[
                { day: "Mon", deliveries: 4, earnings: 1200 },
                { day: "Tue", deliveries: 5, earnings: 1500 },
                { day: "Wed", deliveries: 6, earnings: 1700 },
                { day: "Thu", deliveries: 3, earnings: 900 },
                { day: "Fri", deliveries: 8, earnings: 2400 },
                { day: "Sat", deliveries: 7, earnings: 2100 },
                { day: "Sun", deliveries: 2, earnings: 600 },
              ]}
              margin={{ top: 20, right: 30, bottom: 10, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" orientation="left" stroke="#FF7F50" />
              <YAxis yAxisId="right" orientation="right" stroke="#4CAF50" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="deliveries" barSize={20} fill="#FF7F50" name="Deliveries" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="earnings"
                stroke="#4CAF50"
                strokeWidth={3}
                dot={{ r: 5 }}
                name="Earnings (Rs)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
