import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  UtensilsCrossed,
  ShoppingBag,
  MessageSquare,
  BarChart3,
  Download,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function ChefDashboard() {
  const navigate = useNavigate();
  const [chef, setChef] = useState(null);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    topDish: "-",
    monthlySales: [],
    dishStats: [],
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#FF7F50", "#FFB347", "#FF6347", "#FF4500", "#FFA07A"];

  // ✅ Fetch Stats + Weekly Data
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, weeklyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/orders/chef-stats", { headers }),
        axios.get("http://localhost:5000/api/orders/chef-weekly-stats", { headers }),
      ]);

      setStats(statsRes.data);
      setWeeklyData(weeklyRes.data);
    } catch (err) {
      console.error("Error fetching chef stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ useEffect — Authentication + Socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) {
      navigate("/login");
      return;
    }
    if (user.role !== "chef") {
      navigate("/");
      return;
    }

    setChef(user);
    fetchStats();

    const socket = io("http://localhost:5000");
    socket.on("orderCreated", () => {
      console.log("📦 New order detected — refreshing stats!");
      fetchStats();
    });

    return () => socket.disconnect();
  }, [navigate]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ Download PDF Report
  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Chef Performance Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Chef: ${chef?.name || "Unknown"}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 36);

    doc.text("------------------------------------------------------", 14, 40);
    doc.text(`Total Revenue: Rs. ${stats.revenue}`, 14, 50);
    doc.text(`Total Orders: ${stats.orders}`, 14, 58);
    doc.text(`Top Dish: ${stats.topDish}`, 14, 66);

    const monthlyData = stats.monthlySales.map((m) => [m.month, `Rs. ${m.revenue}`]);
    doc.autoTable({ startY: 80, head: [["Month", "Revenue"]], body: monthlyData });

    const dishData = stats.dishStats.map((d) => [d.name, d.orders]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Dish Name", "Orders"]],
      body: dishData,
    });

    doc.save("Chef_Report.pdf");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-orange-500 to-red-600 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-white/20">
          🍳 Chef Dashboard
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <button
            onClick={() => navigate("/dishes")}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 w-full text-left"
          >
            <UtensilsCrossed size={20} /> Manage Dishes
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 w-full text-left"
          >
            <ShoppingBag size={20} /> View Orders
          </button>
          <button
            onClick={() => navigate("/chef/feedback")}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 w-full text-left"
          >
            <MessageSquare size={20} /> Feedback
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 w-full text-left"
          >
            <Download size={20} /> Download Report
          </button>
        </nav>
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/20 w-full text-left"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {chef?.name || "Chef"}
          </h1>
          <span className="text-gray-500">Role: Chef</span>
        </header>

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">Loading dashboard...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
                <p className="text-3xl font-bold text-orange-600">Rs. {stats.revenue}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
                <p className="text-3xl font-bold text-green-600">{stats.orders}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-2">Top Dish</h2>
                <p className="text-2xl font-bold text-purple-600">{stats.topDish}</p>
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart - Monthly Revenue */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={20} /> Monthly Revenue
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `Rs. ${value}`} />
                    <Bar dataKey="revenue" fill="#FF7F50" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Top Dishes */}
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🍽️ Top Selling Dishes
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.dishStats}
                      dataKey="orders"
                      nameKey="name"
                      outerRadius={120}
                      label
                    >
                      {stats.dishStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Weekly Orders Trend */}
            <section className="mt-10 bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} /> Weekly Orders Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekRange" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`${v} Orders`, "Total Orders"]} />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#FF4500"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </section>

            
          </>
        )}
      </main>
    </div>
  );
}


