import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import chefRoutes from "./routes/chefRoutes.js";
import dishRoutes from "./routes/dishRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import postRoutes from "./routes/postRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import orderEmailRoutes from "./routes/orderEmailRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";








dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Step 4: Setup __dirname (because ES modules don’t have it by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/chefs", chefRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/order-email", orderEmailRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);





import { createServer } from "http";
import { Server } from "socket.io";

//existing imports and app setup ...

const PORT = process.env.PORT || 5000;
const server = createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend URL
    methods: ["GET", "POST"]
  },
});

io.on("connection", (socket) => {
  console.log(" New client connected");
  
  socket.on("disconnect", () => {
    console.log(" Client disconnected");
  });
});

// ✅ Export io instance to use in controllers
export { io };

// ✅ Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

