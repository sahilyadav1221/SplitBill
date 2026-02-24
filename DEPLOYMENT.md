# Deployment Guide 🚀
This guide walks you through deploying SplitMint to the cloud for free.

## 1. Prerequisites 📋
- A GitHub account (Code must be pushed).
- A [Render](https://render.com) account (for Backend).
- A [Vercel](https://vercel.com) account (for Frontend).

---

## 2. Deploy Backend (Render) 🐍
We will use Render to host the Python FastAPI backend.

1.  **New Web Service:**
    - Go to Dashboard -> New -> Web Service.
    - Connect your GitHub repository (`SplitMint`).
2.  **Configuration:**
    - **Name:** `splitmint-backend`
    - **Region:** Singapore (or closest to you)
    - **Branch:** `main`
    - **Root Directory:** `backend` (Important!)
    - **Runtime:** Python 3
    - **Build Command:** `pip install -r requirements.txt`
    - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port 10000`
3.  **Environment Variables:**
    - Add the following variables:
        - `PYTHON_VERSION`: `3.10.0`
        - `GEMINI_API_KEY`: *(Your Google API Key)*
        - `SECRET_KEY`: *(Generate a secure random string)*
        - `ALLOWED_ORIGINS`: `https://YOUR-VERCEL-FRONTEND-URL.vercel.app` (You can start with `*` or update this *after* deploying frontend).
4.  **Database Note:**
    - By default, it will use SQLite. **Warning:** Render's free tier has an ephemeral filesystem. **Your database will reset every time you deploy.**
    - **For Persistence:** You should create a "PostgreSQL" database on Render (New -> PostgreSQL) and add `DATABASE_URL` environment variable pointing to it (e.g., `postgresql://user:pass@host/db`).

Click **Create Web Service**. Wait for it to build. Note down the **Service URL** (e.g., `https://splitmint-backend.onrender.com`).

---

## 3. Deploy Frontend (Vercel) ⚛️
We will use Vercel to host the Next.js frontend.

1.  **Import Project:**
    - Go to Vercel Dashboard -> Add New -> Project.
    - Import `SplitMint`.
2.  **Configuration:**
    - **Framework Preset:** Next.js
    - **Root Directory:** `frontend` (Click Edit -> Select `frontend`).
3.  **Environment Variables:**
    - Add the following variable:
        - `NEXT_PUBLIC_API_URL`: `https://splitmint-backend.onrender.com` (The URL you got from Render).
4.  **Deploy:**
    - Click **Deploy**.

---

## 4. Final Connection 🔗
Once Vercel finishes:
1.  Copy your new frontend domain (e.g., `https://splitmint.vercel.app`).
2.  Go back to Render -> Environment Variables.
3.  Update `ALLOWED_ORIGINS` to match this domain (or keep it `*` if you just want it to work easily).

**Success!** Your SplitMint app is now live on the web! 🎉
