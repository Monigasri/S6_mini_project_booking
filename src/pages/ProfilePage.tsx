import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, Save, X, ArrowLeft, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ ...user });
    }
  }, [user]);

  if (!user) return null;

  const handleBack = () => {
    if (editing) {
      setShowConfirm(true);
    } else {
      navigate(-1);
    }
  };

  const confirmBack = () => {
    setEditing(false);
    setShowConfirm(false);
    navigate(-1);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    setLoading(true);
    try {
      const result = await api.updateProfile(user.id, {
        ...form,
        // Ensure numeric fields are numbers
        totalExperience: Number(form.totalExperience),
        yearsInCurrentCompany: Number(form.yearsInCurrentCompany),
        graduationYear: Number(form.graduationYear),
        // Ensure skills is array if it's a string (from input)
        skills: typeof form.skills === "string" ? form.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : form.skills
      });

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

  const alumniFields = [
    { key: "name", label: "Full Name" },
    { key: "photoUrl", label: "Profile Photo URL" },
    { key: "email", label: "Email", disabled: true },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "profession", label: "Profession" },
    { key: "company", label: "Current Company" },
    { key: "previousCompany", label: "Previous Company" },
    { key: "industry", label: "Industry" },
    { key: "yearsInCurrentCompany", label: "Years in Current Company", type: "number" },
    { key: "totalExperience", label: "Total Experience (years)", type: "number" },
    { key: "linkedin", label: "LinkedIn URL" },
    { key: "skills", label: "Skills (comma separated)", type: "text", isArray: true },
    { key: "college", label: "College / University" },
    { key: "degree", label: "Degree" },
    { key: "graduationYear", label: "Graduation Year", type: "number" },
    { key: "meetingMode", label: "Meeting Mode (Online/Offline/Both)" },
    { key: "description", label: "Bio", type: "textarea" },
  ];

  const studentFields = [
    { key: "name", label: "Full Name" },
    { key: "photoUrl", label: "Profile Photo URL" },
    { key: "email", label: "Email", disabled: true },
    { key: "phone", label: "Phone" },
    { key: "location", label: "Location" },
    { key: "college", label: "College / University" },
    { key: "degree", label: "Degree" },
    { key: "department", label: "Department / Major" },
    { key: "year", label: "Current Year" },
    { key: "cgpa", label: "CGPA", type: "number" },
    { key: "graduationYear", label: "Graduation Year", type: "number" },
    { key: "skills", label: "Skills (comma separated)", type: "text", isArray: true },
    { key: "areaOfInterest", label: "Areas of Interest (comma separated)", type: "text", isArray: true },
    { key: "linkedin", label: "LinkedIn URL" },
    { key: "github", label: "GitHub URL" },
    { key: "mentorshipDomain", label: "Preferred Mentorship Domain" },
    { key: "meetingMode", label: "Preferred Meeting Mode" },
    { key: "description", label: "Bio / Career Goal", type: "textarea" },
  ];

  const fields = user.role === "alumni" ? alumniFields : studentFields;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
          {!editing ? (
            <button type="button" onClick={() => { setForm({ ...user }); setEditing(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-all">
              <Pencil className="h-4 w-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shadow-sm transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setEditing(false);
                  setForm({ ...user });
                }} 
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50 transition-all"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="animate-fade-in rounded-2xl border border-border bg-card p-8 shadow-sm">
          
          <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground overflow-hidden ring-4 ring-background shadow-lg">
              {user.photoUrl ? (
                <img src={user.photoUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
              <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize text-secondary-foreground">{user.role}</span>
                {user.role === "alumni" && form.profession && (
                   <span className="text-sm text-muted-foreground">• {form.profession}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {fields.map(field => (
              <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-sm font-semibold text-muted-foreground">{field.label}</label>
                {editing ? (
                  field.type === "textarea" ? (
                    <textarea
                      value={(form as any)[field.key] || ""}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                      rows={4}
                      disabled={field.disabled}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={field.isArray && Array.isArray((form as any)[field.key]) 
                        ? (form as any)[field.key].join(", ") 
                        : (form as any)[field.key] || ""}
                      onChange={e => setForm({ 
                        ...form, 
                        [field.key]: field.type === "number" ? e.target.value : e.target.value // Handle number conversion on save
                      })}
                      className="w-full rounded-lg border border-input bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm disabled:opacity-50 disabled:bg-muted"
                      disabled={field.disabled}
                    />
                  )
                ) : (
                  <div className="rounded-lg bg-secondary/50 p-3 text-sm text-foreground border border-transparent">
                     {field.key === "skills" && Array.isArray((user as any)[field.key]) 
                        ? (user as any)[field.key].join(", ") || "—" 
                        : (user as any)[field.key] || "—"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-xl border border-border">
            <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
            <p className="text-muted-foreground text-sm mb-6">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmBack}
                className="flex-1 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
              >
                Discard
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
