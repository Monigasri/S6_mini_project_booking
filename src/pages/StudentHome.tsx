import { useState, useEffect } from "react";
import { api, User, Slot } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AlumniCard from "@/components/AlumniCard";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, CheckCircle2, ArrowLeft, Clock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [alumni, setAlumni] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<(Slot & { alumniName?: string })[]>([]);

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
      setBookedSlots(upcoming);
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

  const confirmedCount = bookedSlots.filter((s) => s.status === "approved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Back + Greeting */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          

          
        </div>
        <div className="text-right sm:text-left">
            <h1 className="text-2xl font-bold text-slate-800">
              Hello, {user?.name || "Student"} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Discover alumni mentors and manage your upcoming sessions
            </p>
          </div> <br></br>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN - Alumni Search + List */}
          <div className="lg:col-span-8 space-y-8">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, profession, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-5 py-3.5 shadow-sm 
                           focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 
                           transition duration-200 placeholder:text-slate-400"
              />
            </div>

            {/* Alumni Section */}
<section>
  <h2 className="mb-6 text-2xl font-semibold text-slate-800 flex items-center gap-2">
    Available Mentors
    <span className="text-sm font-normal text-slate-500">
      ({alumni.length})
    </span>
  </h2>

  {loading ? (
    <div className="py-24 text-center text-slate-400 animate-pulse">
      Loading mentors...
    </div>
  ) : alumni.length === 0 ? (
    <div className="py-24 text-center">
      <p className="text-slate-500">
        No alumni found matching your search.
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Try different keywords
      </p>
    </div>
  ) : (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {alumni.map((a) => (
        <div
          key={a.id}
          onClick={() => navigate(`/alumni/${a.id}`)}
          className="
            group
            bg-white
            rounded-3xl
            border border-slate-200
            shadow-sm
            hover:shadow-2xl
            transition-all duration-300
            hover:-translate-y-2
            cursor-pointer
            p-8
            flex flex-col
            justify-between
            min-h-[340px]
          "
        >
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div className="
  h-24 w-24
  rounded-full
  overflow-hidden
  shadow-md
  group-hover:scale-105
  transition
">
  {a.photoUrl ? (
    <img
      src={a.photoUrl}
      alt={a.name}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="
      h-full w-full
      bg-gradient-to-br from-indigo-100 to-indigo-200
      flex items-center justify-center
      text-indigo-600
      text-3xl font-bold
    ">
      {a.name?.charAt(0)}
    </div>
  )}
</div>

            <h3 className="mt-5 text-xl font-semibold text-slate-800">
              {a.name}
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              {a.profession || "Professional"}
            </p>

            {a.company && (
              <p className="text-sm text-slate-500">
                {a.company}
              </p>
            )}
          </div>

          {/* Bottom Info */}
          <div className="mt-6 text-sm text-slate-500 space-y-3 text-center">
            {a.location && (
              <p>{a.location}</p>
            )}

            {a.totalExperience && (
              <span className="
                inline-block
                px-4 py-1.5
                rounded-full
                bg-indigo-50
                text-indigo-600
                text-xs
                font-medium
              ">
                {a.totalExperience} yrs experience
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>
          </div>

          {/* RIGHT COLUMN - Upcoming Sessions Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Summary Card */}
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-5 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Your Sessions
                    </h3>
                    {bookedSlots.length > 0 && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                        {bookedSlots.length}
                      </span>
                    )}
                  </div>
                </div>

                {bookedSlots.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Clock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="font-medium">No upcoming sessions</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Book a mentoring session to get started
                    </p>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {bookedSlots.map((slot) => (
                      <div
                        key={slot.id || slot._id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 hover:bg-slate-100 
                                   transition duration-200 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                              <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{slot.date}</p>
                              <p className="text-sm text-slate-600">{slot.time}</p>
                            </div>
                          </div>

                          <div>
                            {slot.status === "approved" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirmed
                              </span>
                            )}
                            {slot.status === "booked" && (
                              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pl-[52px]">
                          <div className="flex items-center gap-2 text-sm">
                            <UserIcon className="h-4 w-4 text-slate-500" />
                            <span className="font-medium text-slate-700">
                              {slot.alumniName || "Alumni Mentor"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional small confirmed count banner */}
              {/* {confirmedCount > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 p-4 text-sm">
                  <p className="font-medium text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    You have {confirmedCount} confirmed session{confirmedCount > 1 ? "s" : ""}
                  </p>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}