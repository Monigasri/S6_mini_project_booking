import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, Slot } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Code,
  Calendar,
  Linkedin,
  Github,
} from "lucide-react";

export default function AlumniStudentRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slot, setSlot] = useState<Slot | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id ) return;

      try {
        setLoading(true);

        // 🔹 Get alumni slots
        const result = await api.getSlots(user.id);

        const foundSlot =
          result.appointments?.find(
            (s: Slot) => s.id === id || s._id === id
          ) || null;

        if (!foundSlot) {
          setLoading(false);
          return;
        }

        setSlot(foundSlot);

        // 🔹 Fetch student full details
        if (foundSlot.studentId) {
          const res = await fetch(
            `http://localhost:3001/api/students/${foundSlot.studentId}`
          );

          if (res.ok) {
            const data = await res.json();
            setStudent(data);
          } else {
            console.error("Failed to fetch student");
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Load error:", error);
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  // ================= LOADING =================
  if (loading || !slot || !student) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="p-10 text-center text-slate-600">
          Loading student details...
        </div>
      </div>
    );
  }

  // ================= ACTIONS =================
  const handleApprove = async () => {
    await api.approveBooking(slot.id || slot._id || "");
    navigate(-1);
  };

  const handleReject = async () => {
    await api.rejectBooking(slot.id || slot._id || "", rejectReason);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-8 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-blue-100 p-10 space-y-12">

          {/* PERSONAL SECTION */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
              <User className="text-blue-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-800">
                Account & Personal
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {/* PROFILE PHOTO */}
              <div className="flex flex-col items-center">
                <div className="h-28 w-28 rounded-full overflow-hidden border shadow">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-200 flex items-center justify-center text-blue-700 text-3xl font-bold">
                      {student.name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* PERSONAL DETAILS */}
              <div className="md:col-span-2 grid md:grid-cols-2 gap-6 text-sm text-slate-700">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Phone:</strong> {student.phone}</p>
                <p><strong>Location:</strong> {student.location}</p>

                <div className="md:col-span-2">
                  <p><strong>Bio:</strong></p>
                  <p className="text-slate-600 mt-1">{student.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ACADEMIC */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
              <GraduationCap className="text-blue-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-800">
                Academic Details
              </h3>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-700">
              <p><strong>College:</strong> {student.college}</p>
              <p><strong>Degree:</strong> {student.degree}</p>
              <p><strong>Department:</strong> {student.department}</p>
              <p><strong>CGPA:</strong> {student.cgpa}</p>
              <p><strong>Graduation Year:</strong> {student.graduationYear}</p>
            </div>
          </div>

          {/* SKILLS */}
          <div>
            <div className="flex items-center gap-2 mb-6 border-b pb-2">
              <Code className="text-blue-600 w-6 h-6" />
              <h3 className="text-xl font-bold text-slate-800">
                Skills & Preferences
              </h3>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <strong>Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {student.skills?.map((skill: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <p>
                <strong>Areas of Interest:</strong>{" "}
                {student.areaOfInterest}
              </p>

              <div className="flex gap-6 mt-3">
                {student.linkedin && (
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}

                {student.github && (
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-slate-700 hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* SESSION INFO */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-sm text-slate-700">
            <p><strong>Requested Date:</strong> {slot.date}</p>
            <p><strong>Requested Time:</strong> {slot.time}</p>
            <p><strong>Status:</strong> {slot.status}</p>
          </div>

          {/* ACTIONS */}
          {slot.status === "booked" && (
            <div className="border-t pt-8 flex gap-6">
              <button
                onClick={handleApprove}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold"
              >
                Accept Request
              </button>

              <button
                onClick={() => setShowRejectBox(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-semibold"
              >
                Reject
              </button>
            </div>
          )}

          {showRejectBox && (
            <div className="mt-6">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full border rounded-xl p-4"
              />
              <button
                onClick={handleReject}
                className="mt-4 bg-red-600 text-white px-6 py-3 rounded-lg"
              >
                Confirm Reject
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}