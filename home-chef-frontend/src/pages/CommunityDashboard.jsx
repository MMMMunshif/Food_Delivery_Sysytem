import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function CommunityDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
  const [preview, setPreview] = useState(null);

  // ✅ Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [reply, setReply] = useState("");

  // ✅ Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch chat messages
  const fetchChatMessages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chat/general");
      setChatMessages(res.data);
    } catch (err) {
      console.error("Error loading chat:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchChatMessages();

    socket.emit("joinRoom", "general");

    socket.on("receiveMessage", (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  // ✅ Handle send reply
  const handleSendReply = async () => {
    if (!reply.trim()) return;

    const msgData = {
      roomId: "general",
      sender: "Community Forum",
      message: reply,
      senderRole: "community",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendMessage", msgData);
    await axios.post("http://localhost:5000/api/chat", msgData);
    setReply("");
  };

  // ✅ Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPost({ ...newPost, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Create new post
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content)
      return alert("Please fill in all fields.");

    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user"));
      const author = userData?.name || "Community Member";

      const formData = new FormData();
      formData.append("title", newPost.title);
      formData.append("content", newPost.content);
      formData.append("author", author);
      if (newPost.image) formData.append("image", newPost.image);

      await axios.post("http://localhost:5000/api/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Post created successfully!");
      setNewPost({ title: "", content: "", image: null });
      setPreview(null);
      fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to create post.");
    }
  };

  // ✅ Update post
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", editingPost.title);
      formData.append("content", editingPost.content);
      if (editingPost.image) formData.append("image", editingPost.image);

      await axios.put(`http://localhost:5000/api/posts/${editingPost._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Post updated successfully!");
      setEditingPost(null);
      fetchPosts();
    } catch (err) {
      console.error("Error updating post:", err.response?.data || err.message);
    }
  };

  // ✅ Delete post
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Post deleted successfully!");
      fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err.response?.data || err.message);
    }
  };

  // ✅ Download report
  const downloadPostsReport = () => {
    if (posts.length === 0) {
      alert("No posts to generate report.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("🏠 Home Chef - Community Forum Report", 15, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 45, 30);

    const tableData = posts.map((p, i) => [
      i + 1,
      p.title,
      p.author || "Community",
      new Date(p.createdAt).toLocaleDateString(),
    ]);

    doc.autoTable({
      startY: 40,
      head: [["#", "Title", "Author", "Date"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [255, 102, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("© 2025 Home Chef - Community Forum Report", 14, pageHeight - 10);

    doc.save("CommunityForumReport.pdf");
  };

  if (loading)
    return <div className="text-center p-6 text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 grid lg:grid-cols-3 gap-6">
      {/* Left – Community Forum Management */}
      <div className="lg:col-span-2">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-600">Community Forum</h1>
          <button
            onClick={downloadPostsReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            📄 Download Report
          </button>
        </header>

        {/* ✅ Create Post Form */}
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-xl shadow-md mb-8"
          encType="multipart/form-data"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Create a Post</h2>
          <input
            type="text"
            placeholder="Post Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="border p-2 w-full mb-3 rounded"
          />
          <textarea
            placeholder="Post Content"
            rows="4"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="border p-2 w-full mb-3 rounded"
          ></textarea>

          <label className="block text-gray-600 mb-2">Upload Image (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-40 h-40 object-cover rounded mb-4 border"
            />
          )}

          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </form>

        {/* ✅ Posts List */}
        <div className="grid md:grid-cols-2 gap-6">
          {posts.length === 0 ? (
            <p className="text-gray-600">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className="bg-white p-6 rounded-xl shadow-md border relative"
              >
                {post.image && (
                  <img
                    src={`http://localhost:5000${post.image}`}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4">{post.content}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Posted by: <strong>{post.author || "Community Member"}</strong>{" "}
                  on {new Date(post.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ✅ Edit Modal */}
        {editingPost && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Edit Post</h2>
              <input
                type="text"
                value={editingPost.title}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, title: e.target.value })
                }
                className="border p-2 w-full mb-3 rounded"
              />
              <textarea
                value={editingPost.content}
                onChange={(e) =>
                  setEditingPost({ ...editingPost, content: e.target.value })
                }
                className="border p-2 w-full mb-3 rounded"
              ></textarea>

              <label className="block text-gray-600 mb-2">
                Change Image (optional):
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setEditingPost({ ...editingPost, image: e.target.files[0] })
                }
                className="mb-3"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingPost(null)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right – 💬 Live Chat Section */}
      <div className="bg-white p-6 rounded-xl shadow-md flex flex-col">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">
          🗨️ Live Chat with Customers
        </h2>

        <div className="flex-1 bg-gray-100 rounded-lg p-3 overflow-y-auto mb-4">
          {chatMessages.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">No messages yet.</p>
          ) : (
            chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 p-2 rounded-lg w-fit max-w-[75%] ${
                  msg.senderRole === "customer"
                    ? "bg-orange-100 text-gray-800"
                    : "bg-green-200 text-right ml-auto"
                }`}
              >
                <p>{msg.message}</p>
                <span className="block text-xs text-right text-gray-500">
                  {msg.time}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 border p-2 rounded focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendReply}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
