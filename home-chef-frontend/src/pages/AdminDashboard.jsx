import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LogOut,
  Users,
  ClipboardList,
  Utensils,
  MessageSquare,
  Settings,
  FileDown,
  Search,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("users");
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [profile, setProfile] = useState(null);

  // form states for CRUD
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "customer",
    password: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);

  // 🔍 Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fetch Data
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchOrders();
    fetchChefs();
    fetchFeedback();
    fetchProfile();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  const fetchOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data);
  };

  const fetchChefs = async () => {
    const res = await api.get("/chefs");
    setChefs(res.data);
  };

  const fetchFeedback = async () => {
    const res = await api.get("/feedback");
    setFeedback(res.data);
  };

  const fetchProfile = async () => {
    const res = await api.get("/auth/profile");
    setProfile(res.data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ---------- USER CRUD ----------
  const createUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Fill all fields");
      return;
    }
    await api.post("/auth/register", newUser);
    setNewUser({ name: "", email: "", role: "customer", password: "" });
    fetchUsers();
  };

  const updateUser = async () => {
    await api.put(`/users/${editingUser._id}`, editingUser);
    setEditingUser(null);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  // ---------- FEEDBACK CRUD ----------
  const updateFeedback = async () => {
    await api.put(`/feedback/${editingFeedback._id}`, editingFeedback);
    setEditingFeedback(null);
    fetchFeedback();
  };

  const deleteFeedback = async (id) => {
    await api.delete(`/feedback/${id}`);
    fetchFeedback();
  };

  const updateOrderStatus = async (id, status) => {
    await api.put(`/orders/${id}`, { status });
    fetchOrders();
  };

  // ---------- Download Users PDF ----------
  const downloadUsersPDF = async () => {
    const doc = new jsPDF();

    try {
      // Load logo from public folder as base64
      const response = await fetch("/logo.png");
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64Logo = reader.result;

        // Title
        doc.setFontSize(18);
        doc.text("Home Chef - User Report", 40, 20);

        // Subtitle with timestamp
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

        // Table
        const tableData = users.map((u, index) => [
          index + 1,
          u.name,
          u.email,
          u.role,
        ]);

        doc.autoTable({
          head: [["#", "Name", "Email", "Role"]],
          body: tableData,
          startY: 50,
          styles: { fontSize: 11 },
          headStyles: { fillColor: [255, 102, 0] },
        });

        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("© 2025 Home Chef - Admin Report", 14, pageHeight - 10);

        // Save PDF
        doc.save("user-report.pdf");
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error loading logo:", err);
      alert("Could not load logo for PDF.");
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-orange-500 shadow-2xl">
        <div className="p-6">
          {/* Logo/Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-orange-400">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Utensils className="text-orange-500" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Home Chef</h2>
              <p className="text-sm text-orange-100">Admin Panel</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveSection("users")}
              className={`flex gap-3 items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === "users"
                  ? "bg-white text-orange-500 shadow-lg font-semibold"
                  : "text-white hover:bg-orange-400"
              }`}
            >
              <Users size={22} />
              <span>Users</span>
            </button>
            <button
              onClick={() => navigate("/orders")}
              className={`flex gap-3 items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === "orders"
                  ? "bg-white text-orange-500 shadow-lg font-semibold"
                  : "text-white hover:bg-orange-400"
              }`}
            >
              <ClipboardList size={22} />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveSection("feedback")}
              className={`flex gap-3 items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === "feedback"
                  ? "bg-white text-orange-500 shadow-lg font-semibold"
                  : "text-white hover:bg-orange-400"
              }`}
            >
              <MessageSquare size={22} />
              <span>Feedback</span>
            </button>
            <button
              onClick={() => setActiveSection("settings")}
              className={`flex gap-3 items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeSection === "settings"
                  ? "bg-white text-orange-500 shadow-lg font-semibold"
                  : "text-white hover:bg-orange-400"
              }`}
            >
              <Settings size={22} />
              <span>Settings</span>
            </button>

            <div className="h-px bg-orange-400 my-3"></div>

            <button
              onClick={handleLogout}
              className="flex gap-3 items-center px-4 py-3 rounded-xl text-white hover:bg-red-500 transition-all duration-200"
            >
              <LogOut size={22} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* ---------- USERS ---------- */}
          {activeSection === "users" && (
            <div>
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Manage Users
                  </h1>
                  <p className="text-gray-500">
                    Total Users: <span className="font-semibold text-orange-500">{users.length}</span>
                  </p>
                </div>
                <button
                  onClick={downloadUsersPDF}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                >
                  <FileDown size={20} /> Download Report
                </button>
              </div>

              {/* Search + Filter */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or email"
                    className="w-full bg-white border border-gray-300 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="bg-white border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm min-w-[180px]"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="chef">Chef</option>
                  <option value="customer">Customer</option>
                  <option value="delivery">Delivery Partner</option>
                  <option value="community">Community Forum</option>
                </select>
              </div>

              {/* Add new user */}
              <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-200">
                <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
                  <Plus size={20} className="text-orange-500" />
                  Add New User
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <input
                    placeholder="Name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="bg-gray-50 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="customer">Customer</option>
                    <option value="chef">Chef</option>
                    <option value="admin">Admin</option>
                    <option value="delivery">Delivery Partner</option>
                    <option value="community">Community Forum</option>
                  </select>
                  <button
                    onClick={createUser}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Add User
                  </button>
                </div>
              </div>

              {/* User Table */}
              <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200 border-b border-gray-300">
                      <th className="p-4 text-left text-gray-700 font-semibold">
                        Name
                      </th>
                      <th className="p-4 text-left text-gray-700 font-semibold">
                        Email
                      </th>
                      <th className="p-4 text-left text-gray-700 font-semibold">
                        Role
                      </th>
                      <th className="p-4 text-left text-gray-700 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => {
                        if (
                          roleFilter !== "all" &&
                          u.role.toLowerCase() !== roleFilter.toLowerCase()
                        )
                          return false;
                        return (
                          u.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                          u.email
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        );
                      })
                      .map((u, index) => (
                        <tr
                          key={u._id}
                          className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="p-4">
                            {editingUser?._id === u._id ? (
                              <input
                                value={editingUser.name}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    name: e.target.value,
                                  })
                                }
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                              />
                            ) : (
                              <span className="text-gray-800 font-medium">
                                {u.name}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            {editingUser?._id === u._id ? (
                              <input
                                value={editingUser.email}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    email: e.target.value,
                                  })
                                }
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                              />
                            ) : (
                              <span className="text-gray-600">{u.email}</span>
                            )}
                          </td>

                          <td className="p-4">
                            {editingUser?._id === u._id ? (
                              <select
                                value={editingUser.role}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    role: e.target.value,
                                  })
                                }
                                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              >
                                <option value="customer">Customer</option>
                                <option value="chef">Chef</option>
                                <option value="admin">Admin</option>
                                <option value="delivery">Delivery Partner</option>
                                <option value="community">Community Forum</option>
                              </select>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 border border-orange-200">
                                {u.role}
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <div className="flex gap-2">
                              {editingUser?._id === u._id ? (
                                <>
                                  <button
                                    onClick={updateUser}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingUser(u)}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u._id)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ---------- FEEDBACK ---------- */}
          {activeSection === "feedback" && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  Customer Feedback
                </h1>
                <p className="text-gray-500">
                  Total Feedback: <span className="font-semibold text-orange-500">{feedback.length}</span>
                </p>
              </div>

              <div className="space-y-4">
                {feedback.map((f, index) => (
                  <div
                    key={f._id}
                    className="bg-white border border-gray-200 p-6 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200"
                  >
                    {editingFeedback?._id === f._id ? (
                      <div className="flex gap-3">
                        <input
                          value={editingFeedback.message}
                          onChange={(e) =>
                            setEditingFeedback({
                              ...editingFeedback,
                              message: e.target.value,
                            })
                          }
                          className="flex-1 border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={updateFeedback}
                          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingFeedback(null)}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-gray-800 text-lg font-medium">{f.message}</p>
                          <p className="text-gray-500 text-sm mt-2">
                            Feedback #{index + 1}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setEditingFeedback(f)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteFeedback(f._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div>
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Settings</h1>
                <p className="text-gray-500">Manage your preferences</p>
              </div>
              <div className="bg-white border border-gray-200 p-8 shadow-lg rounded-2xl">
                <p className="text-gray-600 text-center">
                  Settings panel coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}