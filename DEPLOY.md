# JM Fitness – Deployment Guide

Deploy the app using **Vercel** (frontend) and **Railway** (backend).

---

## 1. Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `jm-fitness` repo.
4. Set **Root Directory** to `backend`.
5. Add a **Volume** (for SQLite persistence):
   - In your service → **Variables** → **Volumes**
   - Create a volume, mount path: `/data`
6. Set **Environment Variables**:
   - `DATABASE_URL` = `file:/data/dev.db`
   - `JWT_SECRET` = a long random string (e.g. `openssl rand -hex 32`)
   - `FRONTEND_ORIGIN` = your Vercel URL (e.g. `https://jm-fitness.vercel.app`)
   - `PORT` = `4000` (Railway sets this automatically; you can leave it)
7. Deploy. Copy the public URL (e.g. `https://jm-fitness-backend.up.railway.app`).

---

## 2. Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Import your `jm-fitness` repo.
4. Set **Root Directory** to `frontend`.
5. Add **Environment Variable**:
   - `NEXT_PUBLIC_API_BASE_URL` = your Railway backend URL (e.g. `https://jm-fitness-backend.up.railway.app`)
6. Deploy.

---

## 3. Update CORS

After the frontend is deployed, set `FRONTEND_ORIGIN` in Railway to your Vercel URL (e.g. `https://jm-fitness.vercel.app`). Redeploy the backend if needed.

---

## 4. First-Time Setup

After deployment, create a trainer and client via the app, or run a seed script if you add one.

---

## Local Development

- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`
- Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` in `frontend/.env.local`
