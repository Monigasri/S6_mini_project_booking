import { useState, useEffect } from "react";
import { api, Slot } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
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
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
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

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
                  {slot.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
