import { useState, useEffect } from "react";
import { api, Slot } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Calendar, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const result = await api.getHistory();

        if (result.ok) {
          setHistory(result.appointments || []);
        } else {
          console.error(result.error);
          setHistory([]);
        }
      } catch (err) {
        console.error("History load failed:", err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "booked":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-6 text-3xl font-bold">Appointment History</h1>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No appointment history yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((slot) => (
              <div
                key={slot._id}
                className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {statusIcon(slot.status)}
                  <div>
                    <div className="font-medium">
                      {slot.date} at {slot.time}
                    </div>

                    {user?.role === "student" && (
                      <div className="text-sm text-muted-foreground">
                        With Alumni
                      </div>
                    )}

                    {user?.role === "alumni" && slot.bookedByName && (
                      <div className="text-sm text-muted-foreground">
                        Student: {slot.bookedByName}
                      </div>
                    )}

                    {slot.rejectReason && (
                      <div className="mt-1 text-xs text-red-600">
                        Reason: {slot.rejectReason}
                      </div>
                    )}
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs capitalize ${
                    slot.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : slot.status === "booked"
                      ? "bg-yellow-100 text-yellow-800"
                      : slot.status === "rejected" || slot.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {slot.status === "approved" ? "Accepted" : slot.status === "booked" ? "Waiting" : slot.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
