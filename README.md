# 🎬 Movie Watchlist Manager (MERN Stack)

A full-stack, production-ready web application built with the **MERN** stack (MongoDB Atlas, Express.js, React.js + Vite, Node.js) for movie enthusiasts to plan what to watch, track what they are currently watching, and rate what they have finished.

---

## 🚀 Live Demo & Repository Links
- **Frontend Live URL (Vercel):** [https://ict-project-sooty.vercel.app](https://ict-project-sooty.vercel.app)
- **Backend API Live URL (Render):** [https://movie-watchlist-backend-1bm6.onrender.com](https://movie-watchlist-backend-1bm6.onrender.com)
- **GitHub Repository:** [https://github.com/sidharthnotfound2/ict_project.git](https://github.com/sidharthnotfound2/ict_project.git)

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Axios, Lucide Icons, Vanilla CSS (Dark Theme, Responsive Grid)
- **Backend:** Node.js, Express.js, Mongoose, CORS, Dotenv
- **Database:** MongoDB Atlas (M0 Free Tier) with Atomic Sequence Counters & Compound Unique Indexes
- **Hosting:** Vercel (Frontend), Render (Backend Web Service)

---

## ✨ Features & Business Rules
1. **Atomic Code Generation:** Auto-generates sequential codes in format `MV-<releaseYear>-<3-digit sequence>` (e.g., `MV-2010-001`) per release year using atomic MongoDB counters (`findOneAndUpdate` with `$inc` and `upsert`).
2. **Duplicate Prevention:** Enforces case-insensitive uniqueness on `Title + Release Year` both in application logic and via MongoDB compound unique index, returning HTTP `409 Conflict`.
3. **Status Workflow Transitions:**
   - `To Watch` $\rightarrow$ `Watching` or `Watched`
   - `Watching` $\rightarrow$ `Watched` or `To Watch`
   - `Watched` is final and cannot be modified.
   - Any invalid transition is rejected with HTTP `400 Bad Request`.
4. **Mandatory Rating on Completion:**
   - Transitioning to `Watched` requires a mandatory rating (1–10) and automatically stamps the `watchedDate`.
   - Rating cannot be set on movies in `To Watch` or `Watching` status.
   - Existing ratings can be updated for `Watched` movies.
5. **Delete Protection:** Movies in `Watching` status cannot be deleted (disabled in UI with tooltip and rejected with HTTP `400` on backend). Other statuses require confirmation.
6. **Smart Recommendation ("What should I watch next?"):** Returns the `To Watch` movie with the highest priority (1–5). Ties are broken by shortest runtime for quickest viewing.
7. **Real-Time Aggregations Dashboard:**
   - Count per status (guaranteeing counts for `To Watch`, `Watching`, and `Watched` even if zero).
   - Total hours watched (sum of runtime of Watched movies divided by 60, rounded to 1 decimal place).
   - Average rating of watched movies (rounded to 1 decimal place).
   - Genre with the most watched movies (null-safe).
   - Automatically refetched after every Add, Edit, Status change, Rating update, or Delete action.
8. **Search, Filter & Pagination:**
   - Search by title (debounced, case-insensitive, regex-escaped).
   - Filter by Genre and Status.
   - Server-side sorting: `To Watch` movies first sorted by Priority (High to Low), followed by remaining movies sorted by newest first.
   - Paginated at 6 movies per page.

---

## 📂 Project Structure
```text
project-root/
├── frontend/                     # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatsDashboard.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── MovieFormModal.jsx
│   │   │   ├── RatingModal.jsx
│   │   │   ├── WatchNextModal.jsx
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   └── Toast.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios wrapper for all backend routes
│   │   ├── App.jsx
│   │   ├── index.css             # Responsive dark mode design system
│   │   └── main.jsx
│   ├── .env                      # Local frontend environment config
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # SPA routing rewrite rule for Vercel
│   └── vite.config.js
├── backend/                      # Node.js + Express backend
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connection
│   ├── controllers/
│   │   └── movieController.js    # Business logic, aggregations, validations
│   ├── middleware/
│   │   ├── errorHandler.js       # Central error & validation handler
│   │   └── validateObjectId.js   # MongoDB ObjectId validator
│   ├── models/
│   │   ├── Counter.js            # Year-based atomic counter schema
│   │   └── Movie.js              # Movie schema & compound unique index
│   ├── routes/
│   │   └── movieRoutes.js        # Express REST endpoints
│   ├── utils/
│   │   └── codeGenerator.js      # Atomic sequence code generator
│   ├── .env                      # Test/dummy DB credentials for exam evaluators
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Backend listening port | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.bx8ibu7.mongodb.net/movie_watchlist?retryWrites=true&w=majority` |
| `CLIENT_URL` | Frontend URL allowed by CORS | `http://localhost:5173` (or production Vercel URL) |

### Frontend (`frontend/.env`)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base backend API endpoint URL | `http://localhost:5000/api` (or production Render URL `/api`) |

---

## 📡 REST API Reference

Every response adheres to the standardized JSON envelope:
`{ "success": boolean, "message": string, "data": any }`

| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Health check & server uptime | `200` |
| **GET** | `/api/movies` | Get paginated movies (filters: `status`, `genre`, `search`, `page`, `limit`) | `200` |
| **POST** | `/api/movies` | Add new movie with atomic code generation & duplicate check | `201`, `400`, `409` |
| **GET** | `/api/movies/watch-next` | Recommend highest-priority `To Watch` movie (tiebreaker: runtime) | `200`, `404` |
| **GET** | `/api/movies/stats` | Aggregated statistics (counts, hours watched, average rating, top genre) | `200` |
| **GET** | `/api/movies/:id` | Get single movie by ID | `200`, `400`, `404` |
| **PUT** | `/api/movies/:id` | Edit movie (title, genre, runtime, platform, priority). Code & Year immutable | `200`, `400`, `404`, `409` |
| **PATCH**| `/api/movies/:id/status` | Update status transition (`To Watch`, `Watching`, `Watched` + rating) | `200`, `400`, `404` |
| **PATCH**| `/api/movies/:id/rating` | Edit rating for an already `Watched` movie (1–10) | `200`, `400`, `404` |
| **DELETE**| `/api/movies/:id` | Delete movie (forbidden for `Watching` status) | `200`, `400`, `404` |

---

## 💻 Local Setup & Running Instructions

### 1. Clone the repository
```bash
git clone https://github.com/sidharthnotfound2/ict_project.git
cd ict_project
```

### 2. Setup and Run Backend
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 3. Setup and Run Frontend (in a separate terminal)
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### 1. MongoDB Atlas Setup
1. Log into [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a free **M0** cluster.
3. Under **Database Access**, create a user with read/write privileges (or use the provided test credentials).
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
5. In **Database** > **Connect**, copy the connection string and add your database name:
   `mongodb+srv://<username>:<password>@cluster0.bx8ibu7.mongodb.net/movie_watchlist?retryWrites=true&w=majority`

### 2. Backend Deployment on Render
1. Log into [Render](https://render.com/) with GitHub.
2. Click **New +** > **Web Service**.
3. Select your repository: `sidharthnotfound2/ict_project`.
4. Configure service parameters:
   - **Name:** `movie-watchlist-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `PORT`: `5000`
   - `MONGODB_URI`: `mongodb+srv://sidharth225787_db_user:7KItwWBbVCD5vxsJ@cluster0.bx8ibu7.mongodb.net/movie_watchlist?retryWrites=true&w=majority`
   - `CLIENT_URL`: `https://ict-project-sooty.vercel.app`
6. Click **Deploy Web Service**.
> **Note on Free-tier Cold Starts:** Free Render services spin down after 15 minutes of inactivity and may take 30–50 seconds to respond on initial cold wake-up.

### 3. Frontend Deployment on Vercel
1. Log into [Vercel](https://vercel.com/) with GitHub.
2. Click **Add New...** > **Project**.
3. Import your repository: `sidharthnotfound2/ict_project`.
4. Configure project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click edit and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://movie-watchlist-backend-1bm6.onrender.com`
6. Click **Deploy**.
7. Once deployed, verify `CLIENT_URL` in your Render backend settings is set to `https://ict-project-sooty.vercel.app`.

---

## 📸 Screenshots

### 1. Main Watchlist Dashboard (Cards, Filters & Stats)
![Dashboard View](screenshots/Dashboard.png)

### 2. Status Workflow & Recommendation Modal
![Watch Next Modal & Rating Prompt](screenshots/watch_next_modal.png)

---

## 👨‍💻 Author
- Candidate Repository: [https://github.com/sidharthnotfound2/ict_project.git](https://github.com/sidharthnotfound2/ict_project.git)
- Full Stack Development Exit Examination (MERN)
