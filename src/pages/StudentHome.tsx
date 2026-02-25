import { useState, useEffect } from "react";
import { api, User, Slot } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AlumniCard from "@/components/AlumniCard";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [alumni, setAlumni] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<Slot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<
    (Slot & { alumniName?: string })[]
  >([]);

  // ================= FETCH ALUMNI =================
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await api.getAlumni(search || undefined);

      if (response && Array.isArray(response.alumni)) {
        setAlumni(response.alumni);
      } else {
        setAlumni([]);
      }
    } catch (error) {
      console.error("Error fetching alumni:", error);
      setAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH BOOKINGS =================
  const fetchMyBookings = async () => {
    const res = await api.getHistory();

    if (res.ok) {
      const upcoming = res.appointments.filter(
        (a: Slot) =>
          (a.status === "booked" || a.status === "approved") &&
          new Date(`${a.date}T${a.time}`) > new Date()
      );

      setMyBookings(upcoming);

      const booked = res.appointments.filter(
        (a: Slot) =>
          (a.status === "booked" || a.status === "approved") &&
          new Date(`${a.date}T${a.time}`) > new Date()
      );

      setBookedSlots(booked);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [search]);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      fetchMyBookings();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Greeting Section */}
        <div className="mb-10 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-800">
            Hello {user?.name || "Student"} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Find alumni mentors and book your next session.
          </p>
        </div>

        

        {/* Confirmed Sessions Banner */}
        {bookedSlots.filter((s) => s.status === "approved").length > 0 && (
          <div className="mb-8 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white shadow-md">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Upcoming Confirmed Sessions
            </h2>
            <p className="mt-1 text-sm opacity-90">
              You have{" "}
              <strong>
                {bookedSlots.filter((s) => s.status === "approved").length}
              </strong>{" "}
              confirmed appointment(s).
            </p>
          </div>
        )}

        {/* Booked Sessions Section */}
        {bookedSlots.length > 0 && (
          <div className="mb-14 rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Your Sessions
                </h2>
                <p className="text-xs text-slate-500">
                  Upcoming mentoring appointments
                </p>
              </div>
              <div className="text-2xl font-semibold text-slate-300">
                {bookedSlots.length}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bookedSlots.map((slot) => (
                <div
                  key={slot.id || slot._id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-200">
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {slot.date}
                      </p>
                      <p className="text-xs text-slate-500">
                        {slot.time}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs text-slate-400">Mentor</p>
                    <p className="text-sm font-medium text-slate-700">
                      {slot.alumniName || "Alumni"}
                    </p>
                  </div>

                  <div className="mt-5">
                    {slot.status === "approved" && (
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        Accepted
                      </span>
                    )}
                    {slot.status === "booked" && (
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                        Waiting
                      </span>
                    )}
                    {slot.status === "rejected" && (
                      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Search */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alumni by name, profession, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
            />
          </div>
        </div>

        {/* Alumni Section */}
        <div>
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Available Alumni Mentors
          </h2>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              Loading alumni...
            </div>
          ) : alumni.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No alumni found.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {alumni.map((a) => (
                <AlumniCard key={a.id} alumni={a} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}