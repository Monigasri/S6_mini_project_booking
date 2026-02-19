import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, User, Slot } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Building,
  Clock,
  Mail,
  Phone,
  Calendar,
  X,
  Check,
} from "lucide-react";

export default function AlumniProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState<User | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);
  const [cancelSlot, setCancelSlot] = useState<Slot | null>(null);

  // ================= LOAD DATA FROM BACKEND =================
  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const alumniRes = await api.getAlumniById(id);
      setAlumni(alumniRes);

      const slotRes = await api.getSlots(id);
      setSlots(slotRes.appointments || []);
    } catch (error) {
      console.error("Failed to load alumni profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // ================= BOOK SLOT =================
  const handleBook = async () => {
    if (!confirmSlot) return;

    const appointmentId = confirmSlot.id || confirmSlot._id;
    if (!appointmentId) {
      toast.error("Invalid slot ID");
      return;
    }

    const result = await api.bookSlot(appointmentId);

    if (!result.ok) {
      toast.error(result.error || "Failed to book appointment");
      return;
    }

    // Show success message
    toast.success("Appointment booked successfully!", {
      description: `You have booked an appointment with ${alumni?.name} on ${confirmSlot.date} at ${confirmSlot.time}`,
    });

    setConfirmSlot(null);
    loadData();
    
    // Navigate back to student home after a short delay
    setTimeout(() => {
      navigate("/student/home");
    }, 1500);
  };

  // ================= CANCEL SLOT =================
  const handleCancel = async () => {
    if (!cancelSlot) return;

    const result = await api.cancelBooking(cancelSlot.id);

    if (!result.ok) {
      alert(result.error);
      return;
    }

    setCancelSlot(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-16 text-center">Loading...</div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-16 text-center text-muted-foreground">
          Alumni not found.
        </div>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.status === "available");
  const myBookedSlots = slots.filter(
    (s) => s.status === "booked" && s.studentId === user?.id
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate("/student/home")}
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* PROFILE CARD */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
              {alumni.name.charAt(0)}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{alumni.name}</h1>

              <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {alumni.profession}
                </span>

                <span className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  {alumni.company}
                </span>

                {alumni.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {alumni.location}
                  </span>
                )}
              </div>
            </div>
          </div>

          {alumni.description && (
            <p className="mt-4 text-sm">{alumni.description}</p>
          )}
        </div>

        {/* AVAILABLE SLOTS */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">
            Available Appointment Slots
          </h2>

          {availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No available slots.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setConfirmSlot(slot)}
                  className="flex items-center gap-2 rounded-lg border p-3 hover:border-primary"
                >
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div>{slot.date}</div>
                    <div className="text-muted-foreground">
                      {slot.time}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* BOOK MODAL */}
      {confirmSlot && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h3 className="text-lg font-semibold">Confirm Booking</h3>

            <p className="mt-2 text-sm">
              Book appointment on {confirmSlot.date} at {confirmSlot.time}?
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleBook}
                className="flex-1 bg-primary text-white py-2 rounded"
              >
                Confirm
              </button>

              <button
                onClick={() => setConfirmSlot(null)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
