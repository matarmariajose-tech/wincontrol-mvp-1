# 🚀 Wincontrol

Wincontrol is a real estate management platform designed to streamline the full commercial workflow:

**Lead → Scheduling → Visit → Offer → Closing**

This project is being developed in phases, starting with a functional MVP and evolving into a scalable production-ready system.

---

# 🎯 Project Goal

The main objective is to build a platform that allows:

* Lead capture and management
* Automatic agent assignment
* Visit scheduling with time-slot validation
* Visit tracking and status management
* Communication via Email and WhatsApp (future phases)

---

# 🧱 Project Structure

```
wincontrol/
│
├── backend/                # API (TypeScript, Express)
│   ├── src/
│   │   ├── leads/          # Leads module
│   │   │   ├── domain/
│   │   │   ├── dto/
│   │   │   ├── infrastructure/
│   │   │   ├── lead.controller.ts
│   │   │   ├── lead.service.ts
│   │   │   └── lead.routes.ts
│   │   │
│   │   ├── visits/         # Visits module
│   │   │   ├── domain/
│   │   │   ├── dto/
│   │   │   ├── infrastructure/
│   │   │   ├── visit.controller.ts
│   │   │   ├── visit.service.ts
│   │   │   └── visit.routes.ts
│   │   │
│   │   └── app.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   └── prototype/          # UI prototypes (CodePen-based)
│       ├── admin/          # Admin dashboard
│       │   ├── index.html
│       │   ├── styles.css
│       │   └── script.js
│       │
│       └── comercial/      # Commercial dashboard
│           ├── index.html
│           ├── styles.css
│           └── script.js
│
│
├── .gitignore
└── README.md
```

---

# 🧠 Architecture

The backend follows a **modular architecture inspired by Clean Architecture principles**:

* **domain/** → core entities
* **dto/** → data transfer objects (input/output validation)
* **infrastructure/** → data access layer (repositories)
* **service** → business logic
* **controller** → request handling
* **routes** → API endpoints

This structure ensures scalability, maintainability, and clear separation of concerns.

---

# 👥 System Roles

The platform supports different user roles:

### 🟦 Commercial

* Manage visits
* Track visit status
* Interact with clients

### 🟪 Admin

* Manage leads
* Control system flow
* Simulate external integrations (e.g., Idealista)

> Note: Both roles currently share similar UI structures but will diverge functionally in future phases.

---

# 🧪 Current Status

**Phase: MVP - Initial Setup (Weeks 1–2)**

Implemented:

* Project structure (frontend + backend)
* TypeScript backend with modular architecture
* Basic API endpoints:

  * `GET /api/leads`
  * `POST /api/leads`
  * `GET /api/visits`
  * `POST /api/visits`
* UI prototypes based on CodePen

---

# 🔗 API Endpoints

### Leads

* `GET /api/leads` → Retrieve all leads
* `POST /api/leads` → Create a new lead

### Visits

* `GET /api/visits` → Retrieve all visits
* `POST /api/visits` → Create a new visit

---

# ⚙️ Tech Stack

### Backend

* Node.js
* TypeScript
* Express

### Frontend (Prototype)

* HTML / CSS / JavaScript (CodePen)

---

# ▶️ Getting Started

## 1. Clone the repository

```
git clone <your-repo-url>
cd wincontrol/backend
```

## 2. Install dependencies

```
npm install
```

## 3. Run the server

```
npm run dev
```

## 4. Test the API

```
http://localhost:3000/health
```

---

# 🧩 Frontend Prototype

The frontend is currently a **static prototype** built in CodePen and organized into:

* `/frontend/prototype/admin`
* `/frontend/prototype/comercial`

These prototypes are not yet connected to the backend.

---

# 🔜 Next Steps

* Connect frontend to backend APIs
* Implement persistent database (PostgreSQL / MongoDB)
* Add authentication and role-based access
* Integrate email (SendGrid / SES)
* Integrate WhatsApp (Twilio / Meta API)
* Improve UI and migrate to a modern framework (e.g., React)

---

# 📌 Notes

* This repository represents the **initial foundation of the system**
* The architecture is designed to support future scalability and production readiness
* The current implementation focuses on delivering a working MVP

---

# 👨‍💻 Author

Project initialized as part of a structured development plan for Wincontrol.
