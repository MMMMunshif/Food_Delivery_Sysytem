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

  // ---------- 📥 Download Users PDF ----------
  const downloadUsersPDF = async () => {
  const doc = new jsPDF();

  try {
    // Load logo from public folder as base64
    const response = await fetch("/logo.png");
    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Logo = reader.result;

      // Add Logo
     // doc.addImage(base64Logo, "PNG", 14, 10, 20, 20);

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
      <div className="w-64 bg-orange-500 to-red-600lg p-4">
        <h2 className="text-2xl font-bold text-white-600 mb-6">Admin Panel</h2>
        <nav className="flex flex-col gap-3">
          <button
            onClick={() => setActiveSection("users")}
             className="flex gap-2 items-center text-white hover:text-orange-600"
          >
            <Users /> Users
          </button>
          <button
           onClick={() => navigate("/orders")}
            className="flex gap-2 items-center text-white hover:text-orange-600"
          >
            <ClipboardList /> Orders
          </button>
          <button
           onClick={() => setActiveSection("chefs")}
           className="flex gap-2 items-center text-white hover:text-orange-600"
          >
            <Utensils /> Chefs
          </button>
          <button
            onClick={() => setActiveSection("feedback")}
            className="flex gap-2 items-center text-white hover:text-orange-600"
          >
            <MessageSquare /> Feedback
          </button>
          <button
            onClick={() => setActiveSection("settings")}
          className="flex gap-2 items-center text-white hover:text-orange-600"
          >
            <Settings /> Settings
          </button>
          <button
            onClick={handleLogout}
             className="flex gap-2 items-center text-white hover:text-orange-600"
          >
            <LogOut /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* ---------- USERS ---------- */}
        {activeSection === "users" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Manage Users</h1>
              <button
                onClick={downloadUsersPDF}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <FileDown size={18} /> Download Users
              </button>
            </div>

            {/* 🔍 Search + Filter */}
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by name or email"
                className="border p-2 rounded w-1/2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="border p-2 rounded"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="chef">Chef</option>
                <option value="customer">Customer</option>
                <option value="delivery">DeliveryPartner</option>
                <option value="community">Community Forum</option>
              </select>
            </div>

            {/* Add new user */}
            <div className="bg-white shadow p-4 rounded mb-4 flex gap-3">
              <input
                placeholder="Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <input
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="border p-2 rounded flex-1"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="customer">Customer</option>
                <option value="chef">Chef</option>
                <option value="admin">Admin</option>
                <option value="delivery">DeliveryPartner</option>
                <option value="community">Community Forum</option>
              </select>
              <button
                onClick={createUser}
                className="bg-green-500 text-white px-4 rounded"
              >
                Add
              </button>
            </div>

            {/* User Table */}
            <table className="w-full bg-white shadow rounded">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2">Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
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
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  })
                  .map((u) => (
                    <tr key={u._id} className="border-b">
                      <td className="p-2">
                        {editingUser?._id === u._id ? (
                          <input
                            value={editingUser.name}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                name: e.target.value,
                              })
                            }
                            className="border p-1"
                          />
                        ) : (
                          u.name
                        )}
                      </td>

                      <td className="p-2">
                        {editingUser?._id === u._id ? (
                          <input
                            value={editingUser.email}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                email: e.target.value,
                              })
                            }
                            className="border p-1"
                          />
                        ) : (
                          u.email
                        )}
                      </td>

                      <td className="p-2">
                        {editingUser?._id === u._id ? (
                          <select
                            value={editingUser.role}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                role: e.target.value,
                              })
                            }
                            className="border p-1"
                          >
                            <option value="customer">Customer</option>
                            <option value="chef">Chef</option>
                            <option value="admin">Admin</option>
                             <option value="delivery">DeliveryPartner</option>
                            <option value="community">Community Forum</option>
                          </select>
                        ) : (
                          u.role
                        )}
                      </td>

                      <td className="p-2 flex gap-2">
                        {editingUser?._id === u._id ? (
                          <>
                            <button
                              onClick={updateUser}
                              className="px-2 py-1 bg-green-500 text-white rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="px-2 py-1 bg-gray-400 text-white rounded"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUser(u)}
                              className="px-2 py-1 bg-blue-500 text-white rounded"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteUser(u._id)}
                              className="px-2 py-1 bg-red-500 text-white rounded"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------- FEEDBACK ---------- */}
        {activeSection === "feedback" && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Customer Feedback</h1>
            {feedback.map((f) => (
              <div key={f._id} className="bg-white p-4 shadow rounded mb-3">
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
                      className="border p-2 flex-1"
                    />
                    <button
                      onClick={updateFeedback}
                      className="bg-green-500 text-white px-3 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFeedback(null)}
                      className="bg-gray-400 text-white px-3 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p>{f.message}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingFeedback(f)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteFeedback(f._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Keep Orders, Chefs, Settings as before */}
      </div>
    </div>
  );
}
