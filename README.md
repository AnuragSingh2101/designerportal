# Architect & Interior Designer Portfolio & Client Connect Portal

A full-stack marketplace connecting independent architects and interior designers with potential clients. Clients can browse portfolios, apply advanced filters (budget, location, style), and send structured project inquiries. Designers have dashboards to manage their projects (CRUD), view average ratings, and handle client inquiries. Admins have moderating controls and analytics graphs.

---

## 💻 Tech Stack
- **Frontend**: React.js (Vite), JavaScript, Vanilla CSS3 (Custom theme), React Router Dom, Lucide Icons
- **Backend**: Node.js + Express.js (REST API, MVC structure)
- **Database**: Database layer via object-document mapper, supporting local memory server and cloud configuration.
- **Authentication**: JWT-based security cookies/headers, password hashing, and role-based route guards.

---

## 📂 Folder Structure
```text
designer-portal/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Running the App Locally

### 1. Run the Backend REST API
Open a terminal in the backend directory and run:
```bash
cd backend
npm start
```
- Starts the API server at `http://localhost:5000`.
- Auto-seeds the database with realistic sample datasets if empty.

### 2. Run the Frontend React Client
Open a new terminal in the frontend directory and run:
```bash
cd frontend
npm run dev
```
- Starts the Vite server at `http://localhost:5173`.
- Open `http://localhost:5173` in your browser.

---

## 🔑 Seeding Credentials for Testing

You can use the following pre-seeded logins:

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Administrator** | *Configured in backend `.env`* | *Configured in backend `.env`* | Platform Moderation, User suspension, Platform stats |
| **Designer Lead** | `julian@vancedesign.com` | `password123` | Julian Vance (SF, Architecture & Interior, 12 yrs exp) |
| **Designer Decorator** | `amelia@cheninteriors.com` | `password123` | Amelia Chen (NYC, Interior-only, Japandi style) |
| **Client Member** | `sarah@gmail.com` | `password123` | Sarah Jenkins (Seeded inquiries & reviews with Julian) |
| **Client Member** | `marcus@yahoo.com` | `password123` | Marcus Aurelius (Seeded inquiries with Julian & Brandon) |
