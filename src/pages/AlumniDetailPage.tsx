import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, User, Slot } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export default function AlumniDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [alumni, setAlumni] = useState<User | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // ✅ Get alumni properly
        const alumniData = await api.getAlumniById(id);
        setAlumni(alumniData);

        // ✅ Get slots properly
const slotResponse = await api.getSlots(id);
const slotData = slotResponse.appointments || [];

const validSlots = slotData.filter((s: Slot) => {

          const slotTime = new Date(`${s.date}T${s.time}`);
          return s.status === "available" && slotTime > new Date();
        });

        setSlots(validSlots);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 text-center">Loading...</div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="py-20 text-center text-red-500">
          Alumni not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-muted-foreground"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Alumni Info */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{alumni.name}</h1>
          <p className="text-muted-foreground">{alumni.profession}</p>
          <p className="text-muted-foreground">{alumni.company}</p>
        </div>

        {/* Slots */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">
            Available Appointment Slots
          </h2>

          {slots.length === 0 ? (
            <div className="rounded-xl border p-4 text-muted-foreground">
              No available slots.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {slots.map((slot) => (
                <button
                  key={slot.id || slot._id}
                  onClick={() => setConfirmSlot(slot)}
                  className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm hover:border-primary"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      {slot.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={14} />
                      {slot.time}
                    </div>
                  </div>

                  <span className="rounded-full bg-primary px-3 py-1 text-xs text-white">
                    Book
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {confirmSlot && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">Confirm Booking</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Connect with <strong>{alumni.name}</strong> on{" "}
              <strong>{confirmSlot.date}</strong> at{" "}
              <strong>{confirmSlot.time}</strong>?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={async () => {
                  const res = await api.bookSlot(
                    confirmSlot.id || confirmSlot._id!
                  );

                  if (!res.ok) {
                    alert(res.error);
                    return;
                  }

alert("Appointment booked successfully!");
setConfirmSlot(null);

// instantly remove booked slot from UI
setSlots((prev) =>
  prev.filter(
    (s) => (s.id || s._id) !== (confirmSlot.id || confirmSlot._id)
  )
);


                  // refresh
                 const updatedResponse = await api.getSlots(id!);
const updatedSlots = updatedResponse.appointments || [];

const valid = updatedSlots.filter((s: Slot) => {

                    const slotTime = new Date(`${s.date}T${s.time}`);
                    return s.status === "available" && slotTime > new Date();
                  });

                  setSlots(valid);
                }}
                className="flex-1 rounded-lg bg-primary py-2 text-white"
              >
                Confirm
              </button>

              <button
                onClick={() => setConfirmSlot(null)}
                className="flex-1 rounded-lg border py-2"
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
