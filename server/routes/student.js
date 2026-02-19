import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Student from "../models/Student.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function toClientStudent(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const { password, _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

function signToken(user) {
  return jwt.sign(
    { id: user.id || user._id?.toString(), role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/student/register
 * Register a new student. Validates required fields: name, email, password, course, phone.
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, course, phone } = req.body;

    if (!name || !email || !password || !course || !phone) {
      return res.status(400).json({
        message: "Name, email, password, course and phone are required",
      });
    }

    const existing = await Student.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      course: course.trim(),
      phone: phone.trim(),
      role: "student",
    });

    const clientUser = toClientStudent(student);
    const token = signToken(clientUser);

    return res.status(201).json({ user: clientUser, token });
  } catch (error) {
    console.error("Error in POST /api/student/register", error);
    return res.status(500).json({ message: "Failed to register student" });
  }
});

export default router;
