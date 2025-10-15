import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // ✅ Fetch feedback when page loads
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get("/feedback");
        setFeedbacks(res.data);
      } catch (err) {
        console.error("Error fetching feedback:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // ✅ Submit new feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await api.post("/feedback", { message });
      setFeedbacks([res.data, ...feedbacks]); // add new one to top
      setMessage("");
      alert("✅ Feedback submitted successfully!");
    } catch (err) {
      console.error("Feedback error:", err.response?.data || err.message);
      alert(" Failed to submit feedback");
    }
  };

  if (loading) return <div className="p-6 text-center">Loading feedback...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Feedback Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-8">
        <h2 className="text-2xl font-bold text-orange-600 mb-4">Share Your Feedback</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            placeholder="Write your feedback here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-orange-400"
            rows={4}
            required
          ></textarea>
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold"
          >
            Submit Feedback
          </button>
        </form>
      </div>

      {/* Feedback List */}
      <div className="w-full max-w-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">What others said</h3>
        {feedbacks.length === 0 ? (
          <p className="text-gray-500">No feedback yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((f) => (
              <div key={f._id} className="bg-white p-4 shadow rounded-lg">
                <p className="text-gray-700">{f.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {f.user?.name || "Anonymous"} • {new Date(f.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
