import mongoose from "mongoose";

/**
 * Student model - separate collection for student users.
 * Replaces the previous single User model for role "student".
 */
const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    course: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, default: "student", enum: ["student"] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model("Student", studentSchema);
