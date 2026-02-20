import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, User, Slot } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Building
} from "lucide-react";

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

        const alumniData = await api.getAlumniById(id);
        setAlumni(alumniData);

        const slotResponse = await api.getSlots(id);
        setSlots(slotResponse.appointments || []);
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
      <div className="min-h-screen bg-[#fdf6ec]">
        <Navbar />
        <div className="py-20 text-center text-blue-900">Loading...</div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-[#fdf6ec]">
        <Navbar />
        <div className="py-20 text-center text-red-500">
          Alumni not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf6ec]">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-900 hover:text-blue-600"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="rounded-3xl bg-white shadow-xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* ================= LEFT SIDE ================= */}
          <div className="space-y-6">

            {/* Profile Section */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-32 w-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-800 overflow-hidden ring-4 ring-white shadow-lg">
                {alumni.photoUrl ? (
                  <img
                    src={alumni.photoUrl}
                    alt={alumni.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  alumni.name?.charAt(0)
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  {alumni.name}
                </h1>

                <p className="text-blue-600 font-medium text-lg">
                  {alumni.profession}
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Building size={14} />
                    {alumni.company}
                  </span>

                  {alumni.location && (
                    <span>• {alumni.location}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-800">
                  {alumni.totalExperience || 0}+
                </div>
                <div className="text-xs text-blue-600 uppercase tracking-wide font-semibold">
                  Years Exp
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-2xl font-bold text-blue-800">
                  {slots.length}
                </div>
                <div className="text-xs text-blue-600 uppercase tracking-wide font-semibold">
                  Total Slots
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">
                About
              </h3>

              <p className="text-slate-600 leading-relaxed">
                {alumni.description || "No description available."}
              </p>
            </div>
          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div>
            <h2 className="text-2xl font-semibold text-blue-900 mb-6">
              Available Slots
            </h2>

            <div className="space-y-4">
              {slots.length === 0 ? (
                <div className="text-gray-500">
                  No slots available.
                </div>
              ) : (
                slots.map((slot) => {
                  let statusStyle =
                    "bg-blue-100 text-blue-800 border-blue-200";

                  if (slot.status === "approved")
                    statusStyle =
                      "bg-green-100 text-green-700 border-green-200";

                  if (slot.status === "cancelled")
                    statusStyle =
                      "bg-red-100 text-red-700 border-red-200";

                  if (slot.status === "booked")
                    statusStyle =
                      "bg-blue-200 text-blue-900 border-blue-300";

                  return (
                    <div
                      key={slot.id || slot._id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${statusStyle}`}
                    >
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          <Calendar size={16} />
                          {slot.date}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} />
                          {slot.time}
                        </div>
                      </div>

                      {slot.status === "available" ? (
                        <button
                          onClick={() => setConfirmSlot(slot)}
                          className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
                        >
                          Book
                        </button>
                      ) : (
                        <span className="text-sm font-semibold capitalize">
                          {slot.status}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ================= BOOKING MODAL ================= */}
      {confirmSlot && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-blue-900">
              Confirm Booking
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Connect with <strong>{alumni.name}</strong> on{" "}
              <strong>{confirmSlot.date}</strong> at{" "}
              <strong>{confirmSlot.time}</strong>?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={async () => {
                  const res = await api.bookSlot(
                    confirmSlot.id || confirmSlot._id!
                  );

                  if (!res.ok) {
                    alert(res.error);
                    return;
                  }

                  setConfirmSlot(null);

                  const updatedResponse = await api.getSlots(id!);
                  setSlots(updatedResponse.appointments || []);
                }}
                className="flex-1 rounded-lg bg-blue-700 py-2 text-white hover:bg-blue-800"
              >
                Confirm
              </button>

              <button
                onClick={() => setConfirmSlot(null)}
                className="flex-1 rounded-lg border border-blue-300 py-2 text-blue-800"
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