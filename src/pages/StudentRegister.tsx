import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { GraduationCap, Mail, Lock, User, ArrowLeft, Phone } from "lucide-react";

export default function StudentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [course, setCourse] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await api.registerStudent({
      name,
      email,
      password,
      course,
      phone,
    });

    if (!result.ok) {
      setError(result.error || "Registration failed");
      return;
    }

    login(result.data.user, result.data.token);
    navigate("/student/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 text-center">
            <GraduationCap className="mx-auto mb-2 h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Student Registration</h1>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="Course"
              value={course}
              onChange={e => setCourse(e.target.value)}
              required
              className="w-full rounded-lg border py-2.5 px-4 text-sm"
            />

            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-primary py-2.5 text-sm font-medium text-white"
            >
              Create Account
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/student/login" className="text-primary underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
