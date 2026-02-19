import { useState, useEffect } from "react";
import { api, User, Slot } from "@/lib/api";
import Navbar from "@/components/Navbar";
import AlumniCard from "@/components/AlumniCard";
import { Search, Calendar, CheckCircle2 } from "lucide-react";

export default function StudentHome() {
  const [alumni, setAlumni] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [myBookings, setMyBookings] = useState<Slot[]>([]);
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
          a.status === "booked" &&
          new Date(`${a.date}T${a.time}`) > new Date()
      );

      setMyBookings(upcoming);

      // Filter booked slots (alumniName is now included in API response)
      const booked = res.appointments.filter(
        (a: Slot) => a.status === "booked" && new Date(`${a.date}T${a.time}`) > new Date()
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

  // Refresh booked slots when component mounts or when returning from booking
  useEffect(() => {
    const handleFocus = () => {
      fetchMyBookings();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Find Alumni Mentors</h1>
          <p className="mt-1 text-muted-foreground">
            Search by name, profession, company, or description
          </p>
        </div>

        {/* Booked Slots Section */}
        {bookedSlots.length > 0 && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50/50 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-green-900">Booked Slots</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Your successfully booked appointments
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookedSlots.map((slot) => (
                <div
                  key={slot.id || slot._id}
                  className="flex items-start gap-3 rounded-lg border border-green-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">
                      {slot.date} at {slot.time}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      With {slot.alumniName || "Alumni"}
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Booked
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search alumni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-card py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            Loading alumni...
          </div>
        ) : alumni.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No alumni found.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((a) => (
              <AlumniCard
                key={a.id || a._id}
                alumni={a}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
