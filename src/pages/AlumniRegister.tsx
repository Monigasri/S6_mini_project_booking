import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function AlumniRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    profession: "",
    company: "",
    totalExperience: "",
    yearsInCurrentCompany: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Manual validation before sending
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.profession ||
      !form.company ||
      !form.totalExperience ||
      !form.yearsInCurrentCompany ||
      !form.phone
    ) {
      setError("All fields are required");
      return;
    }

    const result = await api.registerAlumni({
      name: form.name,
      email: form.email,
      password: form.password,
      profession: form.profession,
      company: form.company,
      totalExperience: parseInt(form.totalExperience),
      yearsInCurrentCompany: parseInt(form.yearsInCurrentCompany),
      phone: form.phone,
    });

    if (!result.ok) {
      setError(result.error || "Registration failed");
      return;
    }

    login(result.data.user, result.data.token);
    navigate("/alumni/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md border p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center mb-6">
          Alumni Registration
        </h2>

        {error && (
          <div className="mb-4 bg-red-100 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input name="name" placeholder="Full Name"
            value={form.name} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="password" type="password" placeholder="Password"
            value={form.password} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="profession" placeholder="Profession"
            value={form.profession} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="company" placeholder="Company"
            value={form.company} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="totalExperience" type="number"
            placeholder="Total Experience (Years)"
            value={form.totalExperience} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="yearsInCurrentCompany" type="number"
            placeholder="Years in Current Company"
            value={form.yearsInCurrentCompany} onChange={handleChange}
            className="border p-2 rounded" />

          <input name="phone" placeholder="Phone"
            value={form.phone} onChange={handleChange}
            className="border p-2 rounded" />

          <button className="bg-blue-600 text-white py-2 rounded">
            Create Account
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/alumni/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
