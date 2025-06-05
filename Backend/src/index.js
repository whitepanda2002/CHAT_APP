import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001; // Fallback for PORT

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());

// Updated CORS configuration
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
}

// Start server and connect to the database
server.listen(PORT, async () => {
  console.log(`🚀 Server is running on PORT: ${PORT}`);
  await connectDB();
});
