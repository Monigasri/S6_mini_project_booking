const BASE_URL = "http://localhost:3001/api";

// ================= TYPES =================
export interface User {
  id: string;
  email: string;
  name: string;
  role: "student" | "alumni";
  profession?: string;
  company?: string;
  description?: string;
  phone?: string;
  location?: string;
  totalExperience?: number;
}

export interface Slot {
  id?: string;
  _id?: string;
  alumniId?: string;
  studentId?: string;

  date: string;
  time: string;

  status: "available" | "booked" | "rejected" | "approved" | "cancelled";

  bookedByName?: string;
  alumniName?: string;
  rejectReason?: string;
}

// ================= HELPER =================
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export const api = {
  // ================= LOGIN =================
  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };

    localStorage.setItem("token", data.token);
    return { ok: true, data };
  },

  // ================= GET STUDENT HISTORY =================
  async getHistory() {
    const res = await fetch(`${BASE_URL}/appointments?history=true`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, appointments: [] };
    }

    return { ok: true, appointments: data.appointments || [] };
  },

  // ================= GET ALL ALUMNI =================
  async getAlumni(search?: string) {
    const query = search ? `?search=${search}` : "";

    const res = await fetch(`${BASE_URL}/alumni${query}`, {
      headers: getAuthHeaders(),
    });

    return await res.json(); // { alumni: [...] }
  },

  // ================= GET SINGLE ALUMNI =================
  async getAlumniById(id: string) {
    const res = await fetch(`${BASE_URL}/alumni/${id}`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json();
    if (!res.ok) {
      return null;
    }

    return data.alumni || null;
  },

  // ================= GET SLOTS =================
  async getSlots(alumniId: string) {
    const res = await fetch(
      `${BASE_URL}/appointments?alumniId=${alumniId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { appointments: [] };
    }

    return data; // 🔥 return full object { appointments: [...] }
  },

  // ================= ADD SLOT =================
  async addSlot(date: string, time: string) {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ date, time }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message };
    }

    return { ok: true, data };
  },

  // ================= BOOK SLOT =================
  async bookSlot(appointmentId: string) {
    const res = await fetch(`${BASE_URL}/appointments/book`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message };
    }

    return { ok: true, data };
  },

  // ================= REJECT SLOT =================
  async rejectBooking(appointmentId: string, reason: string) {
    const res = await fetch(`${BASE_URL}/appointments/reject`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId, reason }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message };
    }

    return { ok: true, data };
  },

  

  // ================= CANCEL SLOT =================
  async cancelSlot(appointmentId: string) {
    const res = await fetch(`${BASE_URL}/appointments/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ appointmentId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.message };
    }

    return { ok: true, data };
  },

  // ================= CANCEL BOOKING (alias for cancelSlot) =================
  async cancelBooking(appointmentId: string) {
    return this.cancelSlot(appointmentId);
  },

  // ================= UPDATE PROFILE =================
  async updateProfile(userId: string, data: Partial<User>) {
    const res = await fetch(`${BASE_URL}/users/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
      return { ok: false, error: responseData.message || "Failed to update profile" };
    }

    return { ok: true, data: responseData.user };
  },
};
