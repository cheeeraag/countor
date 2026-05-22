# 🧠 Countor v4 — Full Stack Mental Wellness Platform

React + Vite frontend with a Node.js + Express + PostgreSQL backend.

---

## 📁 Project Structure

```
countor-v4/
├── backend/          ← Express REST API
└── frontend/         ← React + Vite app
```

---

## 🚀 Quick Setup

### Step 1 — Database (PostgreSQL)

**Option A: Supabase (recommended, free)**
1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **SQL Editor** → paste contents of `backend/db/schema.sql` → Run
3. Go to **Settings → Database → Connection string (URI)** → copy it

**Option B: Railway**
1. Go to [railway.app](https://railway.app) → New project → PostgreSQL
2. Click the DB → **Connect tab** → copy the connection URL
3. Open a query editor → paste `backend/db/schema.sql` → Run

**Option C: Local PostgreSQL**
```bash
psql -U postgres -c "CREATE DATABASE countor;"
psql -U postgres -d countor -f backend/db/schema.sql
# Connection string: postgresql://postgres:password@localhost:5432/countor
```

---

### Step 2 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, SUPERADMIN_EMAIL
npm install
npm run dev
# ✅ API running on http://localhost:3001
```

**Generate a JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Step 3 — Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3001
npm install
npm run dev
# ✅ App running on http://localhost:5173
```

---

## 🌐 Production Deployment

### Backend → Railway or Render

**Railway:**
```bash
# In /backend folder
railway login
railway init
railway up
# Set env vars in Railway dashboard
```

**Render:**
1. Connect GitHub repo
2. New Web Service → Root directory: `backend`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables in the Render dashboard

### Frontend → Vercel

```bash
cd frontend
npm run build
vercel --prod
# Set VITE_API_URL to your deployed backend URL
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | Token expiry e.g. `7d` |
| `PORT` | Server port (default `3001`) |
| `SUPERADMIN_EMAIL` | Your email — gets superadmin role on signup |
| `FRONTEND_URL` | Deployed frontend URL (for CORS) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL e.g. `https://countor-api.railway.app` |
| `VITE_SUPERADMIN_EMAIL` | Must match backend `SUPERADMIN_EMAIL` |

---

## 🗺️ API Reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register user / org request |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user |
| GET | `/api/orgs/approved` | — | Approved orgs for signup dropdown |
| GET | `/api/orgs` | superadmin | All orgs with member counts |
| PUT | `/api/orgs/:id/approve` | superadmin | Approve org + promote user |
| PUT | `/api/orgs/:id/reject` | superadmin | Reject org request |
| POST | `/api/checkins` | user | Save today's check-in (upsert) |
| GET | `/api/checkins` | user | Current user's full history |
| GET | `/api/posts` | optional | Community feed |
| POST | `/api/posts` | user | Create post |
| DELETE | `/api/posts/:id` | user/superadmin | Delete post |
| POST | `/api/posts/:id/upvote` | user | Toggle upvote |
| GET | `/api/posts/:id/comments` | optional | Get comments |
| POST | `/api/posts/:id/comments` | user | Add comment |
| DELETE | `/api/comments/:id` | user/superadmin | Delete comment |
| POST | `/api/comments/:id/upvote` | user | Toggle upvote |
| GET | `/api/admin/stats` | admin | Overview numbers |
| GET | `/api/admin/users` | admin | Users list (scoped by role) |
| GET | `/api/admin/export` | admin | CSV download (scoped by role) |

---

## 👤 Roles

| Role | Access |
|---|---|
| `user` | Dashboard, check-in, community, therapists, streaks |
| `org_admin` | All of above + Org Admin dashboard (their org only) |
| `superadmin` | Everything + all users, all orgs, org approvals |
| `org_admin_pending` | Locked to waiting screen until approved |
| `rejected` | Locked to rejection screen |

---

## ⚠️ Disclaimer

Countor is a screening tool, not a medical device. Crisis support: **iCall 9152987821** (India, free, Mon–Sat 9am–10pm).
