import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import appointmentRoutes from "./routes/appointments.js";
import alumniRoutes from "./routes/alumni.js";
import userRoutes from "./routes/users.js";
import studentRoutes from "./routes/student.js";
import messageRoutes from "./routes/messages.js";
import "./utils/reminderJob.js";

// Always load the root `.env` (regardless of the current working directory).
// In production (Render) you should rely on Render environment variables,
// but this keeps local development working consistently.
const envPath = fileURLToPath(new URL("../.env", import.meta.url));
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
else dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ Missing Mongo connection string. Set `MONGO_URI` (or `MONGODB_URI`).");
  process.exit(1);
}

// Global middleware
app.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/messages", messageRoutes);


// Connect to MongoDB, then start the server.
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ API server listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  });

