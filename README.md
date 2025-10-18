# 🚀 SkillSyncer — AI‑Powered Career Platform

Full‑stack platform connecting Students, Employers, Mentors, and Admins with resume parsing, ATS scoring, role‑based dashboards, and Google OAuth.

## 📋 Table of Contents

- **Features**
- **Architecture**
- **Tech Stack**
- **Quick Start**
- **Project Structure**
- **Configuration**
- **Seeding & Sample Data**
- **Roles & Dashboards**
- **Authentication**
- **Key API Endpoints**
- **ATS & Resume Parsing**
- **Testing**
- **Deployment**
- **Troubleshooting**

## 🌟 Features

- **Resume parsing** (PDF/DOCX, optional OCR) and skill extraction
- **Dual ATS scoring**: rule‑based + NLP/semantic similarity
- **Role‑based dashboards**: Jobseeker, Company, Mentor, Admin
- **Google Sign‑in** for jobseekers
- **Cloud uploads** (Cloudinary) for resumes
- **JWT auth** with RBAC and CORS

## 🏗️ Architecture

MERN mono‑repo with separate frontend and backend apps.

```
Frontend (Vite/React 5173) ←→ Backend (Express 5003) ←→ MongoDB
```

## 🧰 Tech Stack

- **Frontend**: React ^19, Vite ^7, React Router DOM ^7.1, Tailwind ^3.4, Framer Motion ^11.11, Firebase ^12
- **Backend**: Node.js, Express ^4.18, Mongoose ^8.16, JWT ^9, bcryptjs ^3, multer ^1.4.5, nodemailer ^7, firebase‑admin ^13.4, cloudinary ^1.41, pdf-parse ^1.1, mammoth ^1.8, axios ^1.11

## 🚀 Quick Start

1) Clone

```bash
git clone <repo-url>
cd skillsyncerS9
```

2) Install

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

3) Configure

- Create `backend/.env` (see Configuration). Ensure MongoDB is running.
- Update `frontend/src/config/firebase.js` with your Firebase project (or keep as-is for local testing).

4) Run (Windows PowerShell)

```powershell
.# From project root (opens two terminals)
./start-dev.ps1
```

Or manually in two terminals:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

5) URLs

- Frontend: http://localhost:5173
- Backend Health: http://localhost:5003/api/health
- Backend Test: http://localhost:5003/api/test

Note: Backend default port is 5003 (see `backend/server.js`). You can override with `PORT` in `.env`.

## 📁 Project Structure (key paths)

```
skillsyncerS9/
├─ backend/
│  ├─ server.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ admin.js
│  │  └─ jobseeker.js
│  ├─ middleware/auth.js
│  ├─ models/
│  │  ├─ User.js
│  │  └─ JobseekerProfile.js
│  └─ utils/
│     ├─ atsScoring.js
│     ├─ atsScoringNLP.js
│     ├─ resumeParser.js
│     └─ cloudinary.js
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  │  ├─ AdminLogin.jsx
│  │  │  ├─ Footer.jsx
│  │  │  ├─ JobseekerProfileManager.jsx
│  │  │  └─ Navbar.jsx
│  │  ├─ pages/ (About, Auth, Home, Dashboards, ...)
│  │  └─ config/firebase.js
├─ JOBSEEKER_PROFILE_API.md
├─ FIREBASE_SETUP.md
├─ GOOGLE_AUTH_IMPLEMENTATION.md
└─ EMAIL_SETUP.md
```

## 🔧 Configuration

Create `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://127.0.0.1:27017/skillsyncer

# Server
PORT=5003
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=change_me
JWT_EXPIRE=7d

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary (optional but recommended for resume uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=

# External services (optional)
EMBEDDING_ENDPOINT=http://localhost:8000/embed
# OCR_ENDPOINT=http://localhost:9000/ocr
```

Frontend Firebase: update `frontend/src/config/firebase.js` using the guide in `FIREBASE_SETUP.md`.

## 🌱 Seeding & Sample Data

Run from project root unless noted.

```bash
# Create an initial admin user (interactive or uses env)
node backend/seed-admin.js

# Create a test employer account
node backend/seed-test-employer.js

# Initialize database collections and indexes
node backend/scripts/initializeDatabase.js

# Create sample internships (employer must exist)
node backend/scripts/createSampleInternships.js

# Create admin via script (alternative flow)
node backend/scripts/createAdmin.js

# Verify admin can log in (diagnostic)
node backend/scripts/verifyAdmin.js

# Test admin login with supplied creds (diagnostic)
node backend/scripts/testAdminLogin.js
```

Notes:

- Ensure `MONGODB_URI` is reachable before running seeding scripts.
- Admin credentials will be printed in the console when created by seeders; update after first login.

## 👥 Roles & Dashboards

- **Jobseeker**: Build profile, upload resume, view ATS scores and suggestions, manage visibility.
- **Employer/Company**: Post and manage internships, track applications from the Employer Dashboard.
- **Mentor**: Mentor dashboard placeholder present; extend for mentorship workflows.
- **Admin**: Administrative endpoints and scripts for verification and oversight.

Frontend pages include `JobseekerDashboard`, `EmployerDashboard`, `AdminDashboard`, and `MentorDashboard`. The Employer dashboard integrates the full Internship Posting system (create, update, close, delete) with dynamic forms and validation.

## 🔐 Authentication

- Bearer JWT via `Authorization: Bearer <token>`
- Role‑based access with `protect` and `authorize(...roles)` middleware
- Google Sign‑in available for jobseekers; backend endpoint `POST /api/auth/google-signin`

## 🔌 Key API Endpoints

Public health/test

```http
GET /api/health
GET /api/test
```

Jobseeker (auth: jobseeker)

```http
GET   /api/jobseeker/dashboard
GET   /api/jobseeker/profile
PUT   /api/jobseeker/profile
POST  /api/jobseeker/profile
GET   /api/jobseeker/profile/:userId
PUT   /api/jobseeker/profile/:userId
GET   /api/jobseeker/profile/view
GET   /api/jobseeker/profile-suggestions
GET   /api/jobseeker/stats
PATCH /api/jobseeker/profile/visibility
POST  /api/jobseeker/upload-resume
POST  /api/jobseeker/ats-nlp
POST  /api/jobseeker/reanalyze-nlp
GET   /api/jobseeker/ats-score
```

Admin/Auth routes exist and are wired in `backend/server.js`; see source for details.

## 🧠 ATS & Resume Parsing

- Rule‑based ATS scoring in `backend/utils/atsScoring.js`
- NLP/semantic scoring in `backend/utils/atsScoringNLP.js`
- Resume parsing in `backend/utils/resumeParser.js` (PDF/DOCX, optional OCR)


## 🧪 Testing

Run targeted node scripts from project root, for example:

```bash
node test-google-auth.js
node test-profile-api.js
node test-profile-update.js
node test-registration-validation.js
```

Backend script utilities (diagnostics):

```bash
node backend/scripts/testAdminLogin.js
node backend/scripts/verifyAdmin.js
```

Manual checklist:

- Register/login, Google sign‑in, profile create/update
- Upload resume, view ATS scores and suggestions
- Dashboard and protected route access by role

## 🚀 Deployment (high level)

Backend (Node):

```bash
npm ci --omit=dev
NODE_ENV=production PORT=80 node server.js
```

Frontend (Vite):

```bash
npm run build
# Deploy frontend/dist to static hosting (Vercel, Netlify, S3+CloudFront, etc.)
```

## 🛟 Troubleshooting

- Backend health: `GET /api/health` shows DB connection state
- CORS: ensure `FRONTEND_URL` matches your client origin
- Ports: default backend 5003; override via `.env`
- Cloudinary: unsigned uploads need `CLOUDINARY_UPLOAD_PRESET` when no API secret
- See `EMAIL_SETUP.md`, `FIREBASE_SETUP.md` and `JOBSEEKER_PROFILE_API.md` for more

---

Built with ❤️ by the SkillSyncer team
