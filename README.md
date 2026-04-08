# 🚀 Wincontrol

Wincontrol is a real estate management platform designed to streamline the full commercial workflow:

**Lead → Scheduling → Visit → Offer → Closing**

This project is currently in **MVP phase**, with a functional backend, a connected frontend prototype, and a PostgreSQL database running via Docker.

---

# 🎯 Project Goal

The main objective is to build a platform that allows:

* Lead capture and management
* Visit scheduling and tracking
* Status management across the commercial pipeline
* Centralized data persistence (PostgreSQL)
* Future integrations (Email, WhatsApp, external platforms)

---

# 🧱 Project Structure

```
wincontrol/
│
├── backend/                # API (TypeScript, Express, TypeORM)
│   ├── src/
│   │   ├── config/         # DB config + Swagger
│   │   ├── leads/          # Leads module
│   │   ├── visits/         # Visits module
│   │   └── app.ts
│   │
│   ├── .env                # Environment variables (NOT committed)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   └── prototype/
│       ├── admin/          # Admin dashboard (connected to API)
│       │   ├── index.html
│       │   ├── styles.css
│       │   └── script.js
│       │
│       └── comercial/      # Commercial dashboard (UI prototype)
│           ├── index.html
│           ├── styles.css
│           └── script.js
│
├── docker-compose.yml      # PostgreSQL container
├── .gitignore
└── README.md
```

---

# 🧠 Architecture

Backend follows a **modular architecture inspired by Clean Architecture**:

* **domain/** → entities (TypeORM)
* **dto/** → input validation
* **infrastructure/** → repositories (DB access)
* **service** → business logic
* **controller** → request handling
* **routes** → API endpoints

---

# 🗄️ Database

The project uses **PostgreSQL running in Docker**.

### Main Entity

**Visit**

Fields include:

* ref, cliente, inmueble, comercial
* fecha, hora, estado
* source, phone, email
* questionnaire, offer
* createdAt

---

# 🔗 API Endpoints

### Visits

* GET /api/visits → Get all visits
* POST /api/visits → Create visit
* PUT /api/visits/:id → Update visit
* DELETE /api/visits/:id → Delete visit

---

# ⚙️ Tech Stack

### Backend

* Node.js
* TypeScript
* Express
* TypeORM
* PostgreSQL
* Swagger

### Frontend (MVP)

* HTML / CSS / JavaScript
* Fetch API

### DevOps

* Docker
* Docker Compose

---

# ▶️ Getting Started

## 1. Clone the repository

```
git clone <your-repo-url>
cd wincontrol
```

---

## 2. Start database (Docker)

```
docker compose up -d
```

---

## 3. Backend setup

```
cd backend
npm install
```

Create `.env` file inside `/backend`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=wincontrol
```

---

## 4. Run backend

```
npm run dev
```

Expected output:

```
DB connected
Server running on port 3000
```

---

## 5. Test API

Health check:

```
http://localhost:3000/health
```

Swagger docs:

```
http://localhost:3000/api-docs
```

---

# 🖥️ Frontend

## Admin Dashboard

Location:

```
/frontend/prototype/admin
```

Features:

* Create leads
* Edit visits
* Delete visits
* Status tracking
* Filtering and sorting
* Connected to backend API

---

## Commercial Dashboard

Location:

```
/frontend/prototype/comercial
```

Features:

* UI prototype for commercial users
* Visit visualization
* Workflow simulation

> Note: Currently not fully connected to backend.

---

# 🧪 Current Status

**Phase: MVP - Functional Backend + DB + UI**

Implemented:

* Backend API (CRUD visits)
* PostgreSQL with Docker
* TypeORM integration
* Admin frontend connected to API
* Full flow working: create → edit → delete → persist

---

# 🔜 Next Steps

* Add TypeORM migrations
* Persist Leads in database
* Authentication & roles
* Move frontend to React
* Deploy (Docker + cloud)
* Integrations (Email / WhatsApp)

---

# 📌 Notes

* Project evolved from **in-memory storage → PostgreSQL DB**
* Frontend is still a prototype but already integrated
* Architecture is ready to scale

---

# 👨‍💻 Author

Developed as part of an MVP for a real estate platform.

