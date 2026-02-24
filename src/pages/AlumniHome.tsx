import { useState, useEffect } from "react";
import { api, Slot } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function AlumniHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [rejectSlot, setRejectSlot] = useState<Slot | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectReason, setShowRejectReason] = useState(false);

  // ================= LOAD SLOTS =================
  const loadSlots = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await api.getSlots(user.id);
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
    if (slotDateTime <= new Date()) {
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

  // ================= REJECT =================
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
    setShowRejectReason(false);
    loadSlots();
  };

  // ================= APPROVE =================
  const handleApprove = async (slotId: string) => {
    const result = await api.approveBooking(slotId);

    if (!result.ok) {
      alert(result.error || "Failed to accept booking");
      return;
    }

    alert("Booking accepted successfully!");
    setRejectSlot(null);
    loadSlots();
  };

  const now = new Date();

  const activeSlots = slots.filter((s) => {
    const slotDateTime = new Date(`${s.date}T${s.time}`);
    return (
      slotDateTime > now &&
      (s.status === "available" ||
        s.status === "booked" ||
        s.status === "approved")
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Alumni Dashboard
            </h1>
            <p className="text-slate-500">
              Manage your mentoring appointments
            </p>
          </div>

         <button
  type="button"
  onClick={() => setShowAdd(true)}
  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
>
            <Plus className="h-4 w-4" /> Add Slot
          </button>
        </div>

        {/* ================= DASHBOARD 3:1 LAYOUT ================= */}
        {loading ? (
          <div className="py-16 text-center">Loading slots...</div>
        ) : (
          <div className="grid grid-cols-4 gap-8">
            {/* LEFT PANEL */}
            <div className="col-span-3 space-y-10">
              {/* CONFIRMED */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6">
                <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Upcoming Confirmed Sessions
                </h2>

                {activeSlots.filter((s) => s.status === "approved").length ===
                0 ? (
                  <p className="text-slate-500 text-sm">
                    No confirmed sessions yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeSlots
                      .filter((s) => s.status === "approved")
                      .map((slot) => (
                        <div
                          key={slot.id || slot._id}
                          className="border border-blue-100 bg-blue-50 rounded-xl p-4"
                        >
                          <p className="font-medium text-slate-800">
                            {slot.date} • {slot.time}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Student:{" "}
                            <span className="font-semibold">
                              {slot.bookedByName || "Student"}
                            </span>
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* REQUESTS */}
              <div className="bg-white rounded-2xl border border-yellow-100 shadow-md p-6">
                <h2 className="text-xl font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Requests
                </h2>

                {activeSlots.filter((s) => s.status === "booked").length ===
                0 ? (
                  <p className="text-slate-500 text-sm">
                    No pending requests.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeSlots
                      .filter((s) => s.status === "booked")
                      .map((slot) => (
                        <div
                          key={slot.id || slot._id}
                          onClick={() => setRejectSlot(slot)}
                          className="cursor-pointer border border-yellow-200 bg-yellow-50 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <p className="font-medium text-slate-800">
                            {slot.date} • {slot.time}
                          </p>
                          <p className="text-sm text-slate-700 mt-1">
                            Requested by{" "}
                            <span className="font-semibold">
                              {slot.bookedByName || "Student"}
                            </span>
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="col-span-1">
              <div className="bg-white rounded-2xl border border-blue-100 shadow-md p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Your Available Slots
                </h2>

                {activeSlots.filter((s) => s.status === "available").length ===
                0 ? (
                  <p className="text-slate-500 text-sm">
                    No available slots.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {activeSlots
                      .filter((s) => s.status === "available")
                      .map((slot) => (
                        <div
                          key={slot.id || slot._id}
                          className="border border-blue-100 bg-blue-50 rounded-lg p-3 text-sm"
                        >
                          <p className="font-medium text-slate-800">
                            {slot.date}
                          </p>
                          <p className="text-slate-600">{slot.time}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= STUDENT DETAIL POPUP ================= */}
      {rejectSlot && !showRejectReason && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setRejectSlot(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-blue-700">
                Student Appointment Request
              </h3>
            </div>

            <div className="border border-blue-100 rounded-xl p-5 bg-blue-50 space-y-3">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {rejectSlot.bookedByName?.charAt(0) || "S"}
                </div>
                <div>
                  <button
  onClick={() =>
    navigate(
      `/alumni/student-request/${rejectSlot.id || rejectSlot._id}`,
      { state: { returnToPopup: true } }
    )
  }
  className="font-semibold text-blue-700 text-lg hover:underline"
>
  {rejectSlot.bookedByName || "Student"}
</button>

                  <p className="text-sm text-slate-600">
                    {rejectSlot.date} • {rejectSlot.time}
                  </p>
                </div>
              </div>
            </div>

            {rejectSlot.status === "booked" && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() =>
                    handleApprove(rejectSlot.id || rejectSlot._id || "")
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow"
                >
                  Accept Request
                </button>

                <button
                  onClick={() => setShowRejectReason(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium shadow"
                >
                  Reject
                </button>
              </div>
            )}

            <button
              onClick={() => setRejectSlot(null)}
              className="mt-6 w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================= REJECT REASON POPUP ================= */}
      {rejectSlot && showRejectReason && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setShowRejectReason(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-600">
                Reject Appointment
              </h3>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full border border-slate-200 rounded-lg p-3 text-sm"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
              >
                Confirm Reject
              </button>

              <button
                onClick={() => setShowRejectReason(false)}
                className="flex-1 border py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ================= ADD SLOT POPUP ================= */}
{showAdd && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
    onClick={() => setShowAdd(false)}
  >
    <div
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-6">
        <Plus className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-blue-700">
          Add New Slot
        </h3>
      </div>

      <form onSubmit={handleAddSlot} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Select Date
          </label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Select Time
          </label>
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-lg p-2"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
          >
            Add Slot
          </button>

          <button
            type="button"
            onClick={() => setShowAdd(false)}
            className="flex-1 border py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}