# Program In-charge (PI) Information & Academic Administration System

A web-based academic administration system designed to help a **Program In-charge (PI)** manage batches, mentors, and student information within an assigned course.

Built using **React (Vite) + Tailwind CSS** for the frontend, **Python FastAPI** for the backend REST API, and **PostgreSQL / SQLAlchemy** for database storage.

---

## 1. Technology Stack

| Component | Technology |
| --- | --- |
| **Frontend** | React.js (Vite) + Tailwind CSS v3 + Axios |
| **Backend** | Python FastAPI |
| **Database** | PostgreSQL / SQLite (via SQLAlchemy ORM) |
| **Authentication** | JWT (JSON Web Token) with 8-hour expiry |
| **Password Hashing** | bcrypt |
| **API Authorization** | Bearer Token (`Authorization: Bearer <token>`) |

---

## 2. User Role & Academic Hierarchy

```text
Course
  |
  └── Program In-charge (PI) [Authenticated User]
        |
        ├── Batch: 2022-2027
        |     |
        |     ├── Mentor (Dr. Sarah Jenkins)
        |     └── Students (50)
        |
        └── Batch: 2023-2028
              |
              ├── Mentor (Prof. Robert Smith)
              └── Students (50)
```

---

## 3. Project Structure

```text
PI-management/
│
├── README.md
│
├── backend/
│   ├── database.py       # SQLAlchemy engine & session setup
│   ├── models.py         # Database models (Course, PI, Mentor, Batch, Student, MentorHistory)
│   ├── auth.py           # bcrypt hashing, JWT creation & auth dependencies
│   ├── main.py           # FastAPI REST endpoints & course-isolation authorization
│   ├── seed.py           # Database seeder script
│   ├── test_api.py       # Automated integration test suite
│   ├── check_db.py       # DB connection check & .env setup script
│   └── requirements.txt  # Backend dependencies
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js # Tailwind CSS v3 configuration
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── api.js         # Axios client with interceptors
        ├── App.jsx        # Routing, sticky navbar & private route guard
        ├── index.css      # Tailwind directives & theme styles
        └── pages/
            ├── Login.jsx            # Email/password authentication
            ├── Dashboard.jsx        # Course totals & mentor reassignment modal
            ├── BatchStudents.jsx    # Real-time student search & directory
            ├── StudentProfile.jsx   # Detailed student profile view
            └── MentorHistory.jsx    # Mentor assignment audit history
```

---

## 4. Backend Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### Step 1: Navigate to backend and create venv
```bash
cd backend
python -m venv venv
```

Activate virtual environment:
- **Windows PowerShell:** `.\venv\Scripts\Activate.ps1`
- **Linux/macOS:** `source venv/bin/activate`

### Step 2: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Seed the Database
```bash
python seed.py
```

*Demo PI Credentials:*
- **Email:** `pi@example.com`
- **Password:** `your-password`

### Step 4: Run Backend API Server
```bash
uvicorn main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

### Step 5: Run Automated Integration Tests
```bash
python test_api.py
```

---

## 5. Frontend Setup & Run Instructions

### Step 1: Navigate to frontend and install dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 6. Key Features & Enforced Controls

1. **Course Isolation (Security):**
   - Access to batches, student profiles, and mentor history outside the authenticated PI's course is rejected with `404 Not Found` by the backend REST API.

2. **Atomic Mentor Reassignment:**
   - Updating a batch's mentor and recording the `MentorHistory` audit entry (with mandatory reason) executes inside a single database transaction.

3. **Search & Directory:**
   - Real-time search for students by name or roll number.
