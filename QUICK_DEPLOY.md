# Quick Deployment Checklist

## 🚀 Fast Track Deployment (15 minutes)

### 1. Database Setup (5 min)
- [ ] Sign up at [supabase.com](https://supabase.com)
- [ ] Create new project → Copy PostgreSQL connection string

### 2. Backend Deployment (5 min)
- [ ] Sign up at [render.com](https://render.com)
- [ ] New Web Service → Connect GitHub repo
- [ ] Settings:
  - Build: `pip install -r backend/requirements.txt`
  - Start: `cd backend && gunicorn main:app --bind 0.0.0.0:$PORT`
  - Plan: **Free**
- [ ] Add Environment Variables:
  ```
  FLASK_ENV=production
  DATABASE_URL=[your-supabase-connection-string]
  SECRET_KEY=[generate-random-key]
  JWT_SECRET_KEY=[generate-random-key]
  JWT_COOKIE_SECURE=True
  JWT_COOKIE_SAMESITE=None
  CORS_ORIGINS=https://your-frontend.vercel.app
  ```
- [ ] Deploy → Copy backend URL

### 3. Frontend Deployment (3 min)
- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Import GitHub repo
- [ ] Settings:
  - Root Directory: `frontend`
  - Framework: Vite
- [ ] Environment Variable:
  ```
  VITE_API_URL=[your-backend-url]/api
  ```
- [ ] Deploy → Copy frontend URL

### 4. Final Setup (2 min)
- [ ] Update backend CORS_ORIGINS with frontend URL
- [ ] Run database init (Render Shell → `cd backend && python init_db.py`)
- [ ] Test: Visit frontend URL

---

## 🔑 Generate Secret Keys

Run this command twice to get two keys:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Use first for SECRET_KEY, second for JWT_SECRET_KEY.

---

## 📚 Full Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## ✅ Verify Deployment

1. Backend Health: `https://your-backend.onrender.com/health`
2. Frontend: `https://your-frontend.vercel.app`

Done! 🎉

