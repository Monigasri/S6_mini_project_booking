import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Alumni from "../models/Alumni.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function toClientAlumni(doc) {
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
 * POST /api/alumni/register
 * Register a new alumni. Validates required fields per Alumni model.
 */
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profession,
      company,
      previousCompany,
      industry,
      totalExperience,
      yearsInCurrentCompany,
      linkedin,
      skills, // comma separated string or array
      graduationYear,
      degree,
      college,
      phone,
      location,
      description,
      photoUrl,
      meetingMode,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !profession ||
      !company ||
      totalExperience === undefined ||
      yearsInCurrentCompany === undefined ||
      !phone
    ) {
      return res.status(400).json({
        message: "Required fields missing. Please fill all mandatory fields.",
      });
    }

    const totalExp = Number(totalExperience);
    const yearsCurrent = Number(yearsInCurrentCompany);
    if (Number.isNaN(totalExp) || Number.isNaN(yearsCurrent)) {
      return res.status(400).json({
        message: "Experience must be a number",
      });
    }

    const existing = await Alumni.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse skills
    let skillsArray = [];
    if (Array.isArray(skills)) {
      skillsArray = skills;
    } else if (typeof skills === "string") {
      skillsArray = skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const alumni = await Alumni.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,

      profession: profession.trim(),
      company: company.trim(),
      previousCompany: previousCompany ? String(previousCompany).trim() : undefined,
      industry: industry ? String(industry).trim() : undefined,
      totalExperience: totalExp,
      yearsInCurrentCompany: yearsCurrent,
      linkedin: linkedin ? String(linkedin).trim() : undefined,
      skills: skillsArray,

      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      degree: degree ? String(degree).trim() : undefined,
      college: college ? String(college).trim() : undefined,

      phone: phone.trim(),
      location: location ? String(location).trim() : undefined,
      description: description ? String(description).trim() : undefined,
      photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
      meetingMode: meetingMode || "Online",

      role: "alumni",
    });

    const clientUser = toClientAlumni(alumni);
    const token = signToken(clientUser);

    return res.status(201).json({ user: clientUser, token });
  } catch (error) {
    console.error("Error in POST /api/alumni/register", error);
    return res.status(500).json({ message: "Failed to register alumni" });
  }
});

// POST /api/alumni/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const alumni = await Alumni.findOne({ email: email.toLowerCase().trim() });

    if (!alumni) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, alumni.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const clientUser = toClientAlumni(alumni);
    const token = signToken(clientUser);

    return res.json({ user: clientUser, token });
  } catch (error) {
    console.error("Alumni login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

// GET /api/alumni - list alumni (from Alumni collection)
router.get("/", authRequired, async (req, res) => {
  try {
    const search = String(req.query.search || "").toLowerCase();

    const alumni = await Alumni.find({}).lean();

    let filtered = alumni;
    if (search) {
      filtered = alumni.filter(a => {
        const values = [
          a.name,
          a.profession,
          a.company,
          a.description,
        ]
          .filter(Boolean)
          .map(v => String(v).toLowerCase());
        return values.some(v => v.includes(search));
      });
    }

    return res.json({ alumni: filtered.map(doc => toClientAlumni(doc)) });
  } catch (error) {
    console.error("Error in GET /api/alumni", error);
    return res.status(500).json({ message: "Failed to load alumni" });
  }
});

// GET /api/alumni/:id - single alumni profile
router.get("/:id", authRequired, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }
    return res.json({ alumni: toClientAlumni(alumni) });
  } catch (error) {
    console.error("Error in GET /api/alumni/:id", error);
    return res.status(500).json({ message: "Failed to load alumni profile" });
  }
});

export default router;
