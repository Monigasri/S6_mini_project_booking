import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, User, BookOpen, Code, Loader2 } from "lucide-react";

export default function StudentRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    degree: "",
    department: "",
    year: "",
    cgpa: "",
    graduationYear: "",
    skills: "", // comma separated
    areaOfInterest: "", // comma separated
    linkedin: "",
    github: "",
    description: "",
    mentorshipDomain: "",
    meetingMode: "Online",
    location: "",
    photoUrl: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
        if (!form.name || !form.email || !form.password || !form.phone || !form.college || !form.degree) {
            throw new Error("Please fill in all required fields marked with *");
        }

        const result = await api.registerStudent({
            ...form,
            cgpa: Number(form.cgpa),
            graduationYear: Number(form.graduationYear),
            skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
            areaOfInterest: form.areaOfInterest.split(",").map(s => s.trim()).filter(Boolean),
            meetingMode: form.meetingMode as "Online" | "Offline" | "Both",
        });

        if (!result.ok) {
            throw new Error(result.error || "Registration failed");
        }

        login(result.data.user, result.data.token);
        navigate("/student/home");
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Student Registration
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Join the community to connect with alumni mentors.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-10">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* SECTION 1: PERSONAL & ACCOUNT */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <User className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">Account & Personal</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                  <input name="name" required value={form.name} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Password *</label>
                  <input name="password" type="password" required value={form.password} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Phone Number *</label>
                  <input name="phone" required value={form.phone} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Location (City, State, Country)</label>
                  <input name="location" value={form.location} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700">Profile Photo URL</label>
                   <input name="photoUrl" placeholder="https://..." value={form.photoUrl} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Short Bio / Career Goal</label>
                  <textarea name="description" rows={2} value={form.description} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
              </div>
            </div>

            {/* SECTION 2: ACADEMIC */}
             <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <GraduationCap className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">Academic Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">College / University *</label>
                  <input name="college" required value={form.college} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Degree *</label>
                  <input name="degree" placeholder="B.Tech, B.Sc" required value={form.degree} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Department / Major</label>
                  <input name="department" value={form.department} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Current Year</label>
                   <select name="year" value={form.year} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 bg-white">
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                    <option value="Graduated">Graduated</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">CGPA</label>
                  <input name="cgpa" type="number" step="0.01" value={form.cgpa} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Graduation Year</label>
                  <input name="graduationYear" type="number" placeholder="YYYY" value={form.graduationYear} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
              </div>
            </div>

            {/* SECTION 3: SKILLS & PREFERENCES */}
            <div>
              <div className="flex items-center gap-2 mb-6 border-b pb-2">
                <Code className="text-primary w-6 h-6" />
                <h3 className="text-xl font-bold text-slate-800">Skills & Preferences</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Skills (Comma separated)</label>
                  <input name="skills" placeholder="Java, Python, React..." value={form.skills} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Area of Interest (Comma separated)</label>
                  <input name="areaOfInterest" placeholder="AI, Web Dev, Finance..." value={form.areaOfInterest} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">LinkedIn URL</label>
                  <input name="linkedin" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">GitHub URL</label>
                   <input name="github" placeholder="https://github.com/..." value={form.github} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Preferred Mentorship Domain</label>
                  <input name="mentorshipDomain" placeholder="e.g. Software Engineering" value={form.mentorshipDomain} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Preferred Meeting Mode</label>
                    <select name="meetingMode" value={form.meetingMode} onChange={handleChange} 
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white">
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Both">Both</option>
                    </select>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
              </button>
              <p className="text-center text-sm mt-4 text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Login here
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
