import express from "express";

import User from "../models/User.js";
import Student from "../models/Student.js";
import Alumni from "../models/Alumni.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

function toClientUser(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const { password, _id, ...rest } = obj;
  return { id: _id.toString(), ...rest };
}

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile. Uses Student or Alumni model based on role.
 * Legacy User collection is still supported for existing users.
 */
router.put("/profile", authRequired, async (req, res) => {
  try {
    const { role, id } = req.user;

    const allowedStudentFields = ["name", "email", "course", "phone", "location", "about"];
    const allowedAlumniFields = [
      "name",
      "email",
      "profession",
      "company",
      "totalExperience",
      "yearsInCurrentCompany",
      "previousCompany",
      "phone",
      "description",
    ];
    const allowedUserFields = [
      "name",
      "email",
      "profession",
      "company",
      "previousCompany",
      "previousCompanyExp",
      "totalExperience",
      "location",
      "about",
      "phone",
    ];

    let updates = {};
    let Model;
    let allowedFields;

    if (role === "student") {
      Model = Student;
      allowedFields = allowedStudentFields;
    } else if (role === "alumni") {
      Model = Alumni;
      allowedFields = allowedAlumniFields;
    } else {
      Model = User;
      allowedFields = allowedUserFields;
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
        if (field === "totalExperience" || field === "yearsInCurrentCompany") {
          updates[field] = Number(req.body[field]);
        }
      }
    });

    const user = await Model.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: toClientUser(user) });
  } catch (error) {
    console.error("Error in PUT /api/users/profile", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
