import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Pencil, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ ...user });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await api.updateProfile(user.id, form);
      if (result.ok && result.data) {
        updateUser(result.data);
        setEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const fields = user.role === "alumni"
    ? [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "profession", label: "Profession" },
        { key: "company", label: "Company" },
        { key: "previousCompany", label: "Previous Company" },
        { key: "yearsInCurrentCompany", label: "Years in Current Company", type: "number" },
        { key: "totalExperience", label: "Total Experience (years)", type: "number" },
        { key: "phone", label: "Phone" },
        { key: "description", label: "Description", type: "textarea" },
      ]
    : [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "course", label: "Course" },
        { key: "phone", label: "Phone" },
      ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
          {!editing ? (
            <button type="button" onClick={() => { setForm({ ...user }); setEditing(true); }} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Pencil className="h-4 w-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save"}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setEditing(false);
                  setForm({ ...user });
                }} 
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 animate-fade-in rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{user.name}</h2>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{user.role}</span>
            </div>
          </div>

          <div className="grid gap-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="mb-1 block text-sm font-medium text-muted-foreground">{field.label}</label>
                {editing ? (
                  field.type === "textarea" ? (
                    <textarea
                      value={(form as any)[field.key] || ""}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={(form as any)[field.key] || ""}
                      onChange={e => setForm({ ...form, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )
                ) : (
                  <div className="rounded-lg bg-secondary px-3 py-2.5 text-sm text-foreground">
                    {(user as any)[field.key] || "—"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
