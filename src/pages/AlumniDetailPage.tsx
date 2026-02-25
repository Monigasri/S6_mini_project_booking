import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, User, Slot } from "@/lib/api";
import Navbar from "@/components/Navbar";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
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
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="py-24 text-center text-slate-500 text-sm">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="py-24 text-center text-red-500 text-sm">
          Alumni not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= LEFT COLUMN (PROFILE) ================= */}
          <div className="lg:col-span-2 space-y-6">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center gap-6">

                <div className="h-28 w-28 rounded-full overflow-hidden ring-2 ring-blue-100 shadow-sm">
                  {alumni.photoUrl ? (
                    <img
                      src={alumni.photoUrl}
                      alt={alumni.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-100 flex items-center justify-center text-3xl font-semibold text-blue-700">
                      {alumni.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-semibold text-slate-800">
                    {alumni.name}
                  </h1>

                  <p className="text-blue-600 text-sm mt-1">
                    {alumni.profession}
                  </p>

                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                    <Building size={14} /> {alumni.company}
                  </p>

                  {alumni.location && (
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <MapPin size={14} /> {alumni.location}
                    </p>
                  )}

                  <div className="flex gap-6 mt-4 text-xs text-slate-500">
                    <span>
                      <strong>{alumni.totalExperience || 0}+</strong> Years Experience
                    </span>
                    <span>
                      <strong>{slots.length}</strong> Total Slots
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                About
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {alumni.description || "No description provided."}
              </p>
            </div>

            {/* Professional Details Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-6">
                Professional Details
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">

                <div>
                  <p className="text-xs text-slate-400">Industry</p>
                  <p className="font-medium">{alumni.industry || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Previous Company</p>
                  <p className="font-medium">{alumni.previousCompany || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Mentorship Domain</p>
                  <p className="font-medium">{alumni.mentorshipDomain || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Meeting Mode</p>
                  <p className="font-medium">{alumni.meetingMode || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium">{alumni.email || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="font-medium">{alumni.phone || "-"}</p>
                </div>

              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Skills
              </h3>

              <div className="flex flex-wrap gap-2">
                {alumni.skills && alumni.skills.length > 0 ? (
                  alumni.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">
                    No skills listed.
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(alumni.linkedin || alumni.github) && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">
                  Social Profiles
                </h3>

                <div className="flex flex-col gap-3 text-sm">
                  {alumni.linkedin && (
                    <a
                      href={alumni.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <Globe size={14} /> LinkedIn
                    </a>
                  )}

                  {alumni.github && (
                    <a
                      href={alumni.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-700 hover:underline flex items-center gap-2"
                    >
                      <Globe size={14} /> GitHub
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN (SLOTS) ================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 h-fit">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">
              Available Slots
            </h2>

            <div className="space-y-4">
              {slots.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No slots available.
                </p>
              ) : (
                slots.map((slot) => (
                  <div
                    key={slot.id || slot._id}
                    className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Calendar size={14} />
                        {slot.date}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <Clock size={12} />
                        {slot.time}
                      </div>
                    </div>

                    {slot.status === "available" ? (
                      <button
                        onClick={() => setConfirmSlot(slot)}
                        className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Book
                      </button>
                    ) : (
                      <span className="text-xs font-medium capitalize text-slate-500">
                        {slot.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>

      {/* ================= BOOKING MODAL ================= */}
      {confirmSlot && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800">
              Confirm Booking
            </h3>

            <p className="mt-3 text-sm text-slate-600">
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
                className="flex-1 rounded-lg bg-blue-600 py-2 text-white text-sm hover:bg-blue-700 transition"
              >
                Confirm
              </button>

              <button
                onClick={() => setConfirmSlot(null)}
                className="flex-1 rounded-lg border border-slate-300 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
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