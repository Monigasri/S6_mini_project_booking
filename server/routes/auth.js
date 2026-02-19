import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function toClientUser(userDoc) {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject({ versionKey: false }) : userDoc;
  const { password, _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id?.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/login
 * Login checks Student collection first, then Alumni, then legacy User.
 * Returns JWT with id and role. Does not break existing JWT-based auth.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = await Student.findOne({ email: normalizedEmail });
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const clientUser = toClientUser(user);
      const token = signToken(clientUser);
      return res.json({ user: clientUser, token });
    }

    user = await Alumni.findOne({ email: normalizedEmail });
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const clientUser = toClientUser(user);
      const token = signToken(clientUser);
      return res.json({ user: clientUser, token });
    }

    // Legacy: check old User collection so existing users are not broken
    user = await User.findOne({ email: normalizedEmail });
    if (user) {
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const clientUser = toClientUser(user);
      const token = signToken(clientUser);
      return res.json({ user: clientUser, token });
    }

    return res.status(400).json({ message: "Invalid email or password" });
  } catch (error) {
    console.error("Error in /api/auth/login", error);
    return res.status(500).json({ message: "Failed to login" });
  }
});

// Optional: generic register kept for backward compatibility; prefer /api/student/register and /api/alumni/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required" });
    }

    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    const existingAlumni = await Alumni.findOne({ email: email.toLowerCase() });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingStudent || existingAlumni || existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const clientUser = toClientUser(user);
    const token = signToken(clientUser);

    return res.status(201).json({ user: clientUser, token });
  } catch (error) {
    console.error("Error in /api/auth/register", error);
    return res.status(500).json({ message: "Failed to register user" });
  }
});

export default router;
