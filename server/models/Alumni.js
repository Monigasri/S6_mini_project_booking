import mongoose from "mongoose";

/**
 * Alumni model - separate collection for alumni users.
 * Replaces the previous single User model for role "alumni".
 */
const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profession: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    totalExperience: { type: Number, required: true },
    yearsInCurrentCompany: { type: Number, required: true },
    previousCompany: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    description: { type: String, trim: true }, // short bio
    role: { type: String, default: "alumni", enum: ["alumni"] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false, versionKey: false }
);

export default mongoose.model("Alumni", alumniSchema);
