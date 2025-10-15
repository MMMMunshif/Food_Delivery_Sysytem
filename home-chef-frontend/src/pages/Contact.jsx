import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { Send } from "lucide-react";

const socket = io("http://localhost:5000");

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);

  // ✅ Load existing chat history on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/chat/general")
      .then((res) => setMessages(res.data))
      .catch(() => console.log("No previous messages found."));
  }, []);

  // ✅ Listen for new messages
  useEffect(() => {
    socket.emit("joinRoom", "general");
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receiveMessage");
  }, []);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const msg = {
      roomId: "general",
      sender: formData.name || "Customer",
      message: chatInput,
      senderRole: "customer",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendMessage", msg);
    await axios.post("http://localhost:5000/api/chat", msg);

    setChatInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/contact", formData);
      alert(res.data.message || "Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      alert("Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-10 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
        <p className="text-lg opacity-90">We’d love to hear from you! 💬</p>
      </header>

      {/* Contact Info + Form */}
      <section className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-6 py-10">
        {/* Info */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Get in Touch</h2>
          <p className="text-gray-600 leading-relaxed">
            Whether you have a question about our dishes, feedback, or need support — our
            community team is ready to help you anytime!
          </p>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p><b>Email:</b> support@homechef.com</p>
            <p><b>Phone:</b> +94 77 123 4567</p>
            <p><b>Working Hours:</b> Mon–Sat, 9 AM – 6 PM</p>
              <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126743.628!2d79.861243!3d6.927079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae25962c0f4a4e3%3A0x7682c3efaa9ed9e1!2sColombo%2C%20Sri%20Lanka!5e0!3m2!1sen!2slk!4v1666000000000"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            placeholder="Subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows="4"
            className="w-full border p-3 rounded focus:ring-2 focus:ring-orange-500"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* 💬 Live Chat Section */}
      <section className="bg-white shadow-inner py-10">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Live Chat with Community 🗨️
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto shadow-inner mb-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-500 mt-20">
                Start a conversation below 👇
              </p>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 p-2 rounded-lg w-fit max-w-[75%] ${
                    msg.senderRole === "customer"
                      ? "bg-orange-500 text-white ml-auto"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  <p>{msg.message}</p>
                  <span className="block text-xs text-right opacity-70">
                    {msg.time}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg hover:scale-105 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
