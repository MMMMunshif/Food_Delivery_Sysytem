import React, { useEffect, useState } from "react";
import axios from "axios";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function ChefFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: { Authorization: `Bearer ${token}` },
  });

  // ✅ Fetch all feedback
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

  // ✅ Download feedback as PDF
  
const downloadPDF = () => {
  const doc = new jsPDF();

  // 🔹 Add Logo (top-left) – make sure logo.png exists in /public folder
  const logo = new Image();
  logo.src = "/logo.png"; // put your logo in public/logo.png
  //doc.addImage(logo, "PNG", 10, 8, 25, 25);

  // 🔹 Title
  doc.setFontSize(20);
  doc.setTextColor(255, 87, 34); // orange color
  doc.text("Home Chef - Customer Feedback Report", 40, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 28);

  // 🔹 Table
  const tableData = feedbacks.map((f, i) => [
    i + 1,
    f.user?.name || "Anonymous",
    f.message,
    new Date(f.createdAt).toLocaleString(),
  ]);

  autoTable(doc, {
    head: [["#", "Customer", "Feedback", "Date"]],
    body: tableData,
    startY: 40,
    theme: "striped",
    headStyles: { fillColor: [255, 87, 34] }, // orange header
    alternateRowStyles: { fillColor: [255, 241, 232] },
    margin: { left: 10, right: 10 },
  });

  // 🔹 Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    "© 2025 Home Chef. This is an auto-generated report.",
    doc.internal.pageSize.width / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // 🔹 Save File
  doc.save("HomeChef_Feedback_Report.pdf");
};


  if (loading) return <div className="p-6 text-center">Loading feedback...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">Customer Feedback</h1>
        <button
          onClick={downloadPDF}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          <FileDown size={18} /> Download Report
        </button>
      </div>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <p className="text-gray-600">No feedback available yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((f) => (
            <div key={f._id} className="bg-white p-4 shadow rounded-lg">
              <p className="text-gray-700">{f.message}</p>
              <p className="text-xs text-gray-500 mt-2">
                {f.user?.name || "Anonymous"} •{" "}
                {new Date(f.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
