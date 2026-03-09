# 🎓 AlumConnect – Alumni Student Appointment Booking System

AlumConnect is a full-stack web application that connects **students with alumni mentors**.  
Students can explore alumni profiles, book mentorship sessions, and gain career guidance, while alumni can manage their availability and mentor students through scheduled appointments.

The platform provides a structured way for universities to encourage **alumni–student interaction and mentorship**.

---

## 🚀 Features

### 👨‍🎓 Student
- Student registration and login
- Browse and search alumni mentors
- View detailed alumni profiles
- Book available mentoring slots
- Track appointment status
- View upcoming sessions

### 👨‍💼 Alumni
- Alumni registration and login
- Create and manage available time slots
- View student booking requests
- Approve or reject appointments
- Update profile and upload photo

### 📅 Appointment System
- Slot-based booking
- Appointment approval workflow
- Upcoming session tracking
- Appointment history

---

## 🛠 Tech Stack

**Frontend**
- React.js
- TypeScript
- Tailwind CSS
- React Router

**Backend**
- Node.js
- Express.js
- JWT Authentication

**Database**
- MongoDB
- Mongoose

---

## 🏗 System Architecture

Frontend (React + TypeScript)

│

│ REST API

▼

Backend (Node.js + Express)

│

▼

Database (MongoDB)


The frontend communicates with the backend through REST APIs, while the backend manages authentication, business logic, and database operations.

---

## 🗄 Database Collections

**Student**

_id
name
email
password
college
skills
location
photoUrl
role


**Alumni**

_id
name
email
profession
company
skills
graduationYear
location
description
photoUrl
role


**Appointments**

_id
alumniId
studentId
date
time
status


---

## ⚙️ Installation

### Clone Repository

git clone https://github.com/yourusername/alumni-student-appointment-booking.git


### Backend Setup


cd backend
npm install


Create `.env`


PORT=3001
MONGO_URI=mongodb://localhost:27017/appointment-details
JWT_SECRET=your_secret_key


Run server


npm start


### Frontend Setup


cd frontend
npm install
npm run dev


---

## 🌐 API Routes

**Authentication**

POST /api/student/register
POST /api/student/login
POST /api/alumni/register
POST /api/alumni/login


**Alumni**

GET /api/alumni
GET /api/alumni/:id
PUT /api/alumni/:id


**Appointments**

POST /api/appointments
POST /api/appointments/book
POST /api/appointments/reject
POST /api/appointments/complete
POST /api/appointments/cancel
GET /api/appointments


---

## 🔮 Future Improvements

- Video meeting integration
- Email notifications
- Alumni rating and feedback system
- Calendar integration

---

## 👩‍💻 Developer

**Monigasri**  
Full Stack Developer

This project was designed and developed as a complete full-stack application including frontend, backend APIs, authentication system, and database design.
