import { useState, useEffect } from "react";
import { api, Slot } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Plus, Calendar, User, AlertTriangle } from "lucide-react";

export default function AlumniHome() {
  const { user } = useAuth();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [rejectSlot, setRejectSlot] = useState<Slot | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // ================= LOAD SLOTS =================
  const loadSlots = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // For alumni viewing their own slots, backend now returns all slots (available + booked)
      const result = await api.getSlots(user.id);

      // 🔥 Backend returns { appointments: [...] }
      setSlots(result.appointments || []);
    } catch (error) {
      console.error("Failed to load slots:", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [user]);

  // ================= ADD SLOT =================
  const handleAddSlot = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

  const slotDateTime = new Date(`${newDate}T${newTime}`);
  const now = new Date();

  if (slotDateTime <= now) {
    alert("Invalid time: Cannot select past time");
    return;
  }

  const result = await api.addSlot(newDate, newTime);


  if (!result.ok) {
    alert(result.error || "Failed to add slot");
    return;
  }

  alert("Slot added successfully");

  setNewDate("");
  setNewTime("");
  setShowAdd(false);
  loadSlots();
};

  // ================= REJECT SLOT =================
  const handleReject = async () => {
    if (!rejectSlot) return;

    const result = await api.rejectBooking(
      rejectSlot.id || rejectSlot._id || "",
      rejectReason
    );

    if (!result.ok) {
      alert(result.error);
      return;
    }

    setRejectSlot(null);
    setRejectReason("");
    loadSlots();
  };

  const now = new Date();

const activeSlots = slots.filter((s) => {
  const slotDateTime = new Date(`${s.date}T${s.time}`);

  const isFuture = slotDateTime > now;

  const validStatus =
    s.status === "available" || s.status === "booked";

  return isFuture && validStatus;
});

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Appointments</h1>
            <p className="text-muted-foreground">
              Manage your appointment slots
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" /> Add Slot
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">Loading slots...</div>
        ) : activeSlots.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No active slots. Add one to start accepting appointments.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {activeSlots.map((slot) => (
              <div
                key={slot.id || slot._id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">
                    {slot.date} at {slot.time}

                    </div>

                    {slot.status === "booked" && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        Booked by {slot.bookedByName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {slot.status === "available" && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-600">
                      Available
                    </span>
                  )}

                  {slot.status === "booked" && (
                    <>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-600">
                        Booked
                      </span>

                      <button
                        onClick={() => setRejectSlot(slot)}
                        className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= ADD SLOT MODAL ================= */}
      {showAdd && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Add New Slot</h3>

            <form onSubmit={handleAddSlot} className="mt-4 flex flex-col gap-3">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="border p-2 rounded"
              />

              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="border p-2 rounded"
              />

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 border py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {rejectSlot && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40"
          onClick={() => setRejectSlot(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold">
                Reject Appointment
              </h3>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="mt-3 w-full border p-2 rounded"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Reject
              </button>
              <button
                onClick={() => setRejectSlot(null)}
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
