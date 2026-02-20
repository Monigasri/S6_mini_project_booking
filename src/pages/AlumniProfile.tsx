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
  GraduationCap,
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
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white overflow-hidden">
              {alumni.photoUrl ? (
                <img src={alumni.photoUrl} alt={alumni.name} className="h-full w-full object-cover" />
              ) : (
                alumni.name.charAt(0)
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold font-display">{alumni.name}</h1>
                <p className="text-lg text-primary font-medium">{alumni.profession}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {alumni.company} {alumni.yearsInCurrentCompany ? `(${alumni.yearsInCurrentCompany}y)` : ""}
                </span>
                {alumni.previousCompany && (
                   <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Ex: {alumni.previousCompany}
                  </span>
                )}
                {alumni.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {alumni.location}
                  </span>
                )}
                {/* Education Section */}
                {(alumni.college || alumni.degree) && (
                   <span className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    {alumni.degree ? `${alumni.degree}, ` : ""} {alumni.college} {alumni.graduationYear ? `'${alumni.graduationYear.toString().slice(-2)}` : ""}
                  </span>
                )}
              </div>
              
              {alumni.linkedin && (
                <a href={alumni.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium">
                   LinkedIn Profile ↗
                </a>
              )}

              {alumni.skills && alumni.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {alumni.skills.map(skill => (
                    <span key={skill} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {alumni.description && (
            <div className="mt-6 pt-6 border-t border-dashed">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">About</h3>
              <p className="text-base text-foreground leading-relaxed">{alumni.description}</p>
            </div>
          )}
          
           <div className="mt-6 pt-6 border-t border-dashed flex gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase">Total Exp</span>
                <span className="font-semibold">{alumni.totalExperience} Years</span>
              </div>
               <div className="flex flex-col">
                <span className="text-muted-foreground text-xs uppercase">Meeting Mode</span>
                <span className="font-semibold">{alumni.meetingMode || "Online"}</span>
              </div>
           </div>
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
