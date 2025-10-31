# Free Deployment Guide for SmartPay V2

This guide will help you deploy your SmartPay V2 application completely free using:
- **Frontend**: Vercel or Netlify (both free)
- **Backend**: Render.com (free tier available, **but requires credit card**)
- **Database**: Supabase PostgreSQL (free tier)

⚠️ **Note**: Render.com requires a credit card even for free tier.  
👉 **For NO Credit Card options**, see [DEPLOYMENT_ALTERNATIVES.md](./DEPLOYMENT_ALTERNATIVES.md)  
👉 **For AWS/GCP**, see [DEPLOYMENT_AWS.md](./DEPLOYMENT_AWS.md) or [DEPLOYMENT_GCP.md](./DEPLOYMENT_GCP.md)

---

## 📋 Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Your code pushed to a GitHub repository

---

## 🗄️ Step 1: Set Up Free PostgreSQL Database (Supabase)

### Option A: Supabase (Recommended - Free Forever)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `smartpay-v2`
   - **Database Password**: (Save this password securely!)
   - **Region**: Choose closest to you
5. Wait 2-3 minutes for database to be created
6. Once created, go to **Settings** → **Database**
7. Find your **Connection string** under "Connection string" section
8. Copy the **URI** format (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
9. **Keep this connection string safe** - you'll need it for backend deployment

### Alternative: Render.com PostgreSQL

1. Go to [https://render.com](https://render.com)
2. Sign up for a free account
3. Click "New +" → "PostgreSQL"
4. Fill in:
   - **Name**: `smartpay-db`
   - **Database**: `smartpay_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest
   - **Plan**: Free
5. Click "Create Database"
6. Once created, copy the **Internal Database URL** or **External Database URL**

---

## 🚀 Step 2: Deploy Backend to Render.com

1. Go to [https://render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your `smartpay-v2` repository
5. Configure the service:
   - **Name**: `smartpay-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Root Directory**: Leave empty (or set to `backend` if you prefer)
   
6. Under **Environment Variables**, add:
   ```
   FLASK_ENV=production
   FLASK_DEBUG=False
   PORT=5000
   
   DATABASE_URL=postgresql://[your-supabase-connection-string]
   
   SECRET_KEY=your-secret-key-here-generate-a-random-one
   JWT_SECRET_KEY=your-jwt-secret-key-here-generate-a-random-one
   
   JWT_COOKIE_SECURE=True
   JWT_COOKIE_HTTPONLY=True
   JWT_COOKIE_SAMESITE=None
   
   CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.netlify.app
   ```

   **Generate secrets**: You can use this command to generate random keys:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Run it twice to get SECRET_KEY and JWT_SECRET_KEY

7. Select **Free** plan
8. Click "Create Web Service"
9. Wait 5-10 minutes for deployment
10. Once deployed, copy your backend URL (e.g., `https://smartpay-backend.onrender.com`)
   - **Note**: Render free tier spins down after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## 🎨 Step 3: Deploy Frontend to Vercel (Recommended)

### Option A: Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `smartpay-v2` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   
6. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   (Replace with your actual Render backend URL)

7. Click "Deploy"
8. Wait 2-3 minutes for deployment
9. Your app will be live at: `https://your-project-name.vercel.app`

### Option B: Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   
6. Click "Show advanced" and add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   
7. Click "Deploy site"
8. Wait 2-3 minutes for deployment
9. Your app will be live at: `https://random-name.netlify.app`

---

## 🔄 Step 4: Update CORS in Backend

After deploying frontend, update the backend CORS_ORIGINS in Render.com:

1. Go to your Render.com dashboard
2. Click on your backend service
3. Go to **Environment** tab
4. Update `CORS_ORIGINS` to include your frontend URL:
   ```
   CORS_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
   ```
5. Save changes (this will trigger a redeploy)

---

## 🗃️ Step 5: Initialize Database Tables

You need to create the database tables. You have two options:

### Option A: Using Flask Shell (Recommended)

1. In Render.com, go to your backend service
2. Click on **Shell** tab
3. Run:
   ```bash
   cd backend
   python
   ```
4. Then in Python shell:
   ```python
   from main import app
   from models import db
   with app.app_context():
       db.create_all()
       print("Tables created!")
   ```

### Option B: Create a Migration Script

Create `backend/init_db.py`:
```python
from main import app
from models import db

with app.app_context():
    db.create_all()
    print("Database tables created successfully!")
```

Then run it in Render shell:
```bash
cd backend && python init_db.py
```

---

## ✅ Step 6: Verify Deployment

1. **Test Backend**: Visit `https://your-backend.onrender.com/health`
   - Should return: `{"message": "SmartPay API is running!", "status": "healthy"}`

2. **Test Frontend**: Visit your Vercel/Netlify URL
   - Should load the app

3. **Test Connection**: Try logging in or making an API call from frontend

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend returns 500 error
- **Solution**: Check Render.com logs. Common issues:
  - Missing environment variables
  - Database connection string incorrect
  - Tables not created

**Problem**: CORS errors
- **Solution**: Make sure `CORS_ORIGINS` includes your frontend URL exactly (with https://)

**Problem**: Database connection failed
- **Solution**: 
  - Verify DATABASE_URL is correct
  - For Supabase: Make sure you're using the correct password
  - For Render DB: Use Internal Database URL for Render services

### Frontend Issues

**Problem**: Frontend shows blank page
- **Solution**: 
  - Check browser console for errors
  - Verify `VITE_API_URL` is set correctly
  - Make sure API URL ends with `/api` not `/api/api`

**Problem**: API calls failing
- **Solution**:
  - Check if backend is awake (Render free tier spins down)
  - Verify CORS_ORIGINS includes frontend URL
  - Check browser Network tab for actual error

### Database Issues

**Problem**: Tables not created
- **Solution**: Run the initialization script from Step 5

---

## 📝 Notes

### Render.com Free Tier Limitations:
- ⚠️ Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- Limited to 750 hours/month (enough for development/demos)
- For production, consider upgrading to paid tier

### Vercel/Netlify Free Tier:
- ✅ Excellent performance, no spin-down
- ✅ Automatic SSL
- ✅ Fast global CDN
- ✅ Generous bandwidth limits

### Supabase Free Tier:
- ✅ 500 MB database
- ✅ 2 GB bandwidth
- ✅ Good for small to medium apps

---

## 🔐 Security Checklist

- [ ] SECRET_KEY is strong and unique
- [ ] JWT_SECRET_KEY is strong and unique
- [ ] Database password is secure
- [ ] CORS_ORIGINS only includes your domains
- [ ] JWT_COOKIE_SECURE is True in production
- [ ] Never commit `.env` files to GitHub

---

## 🎉 You're Done!

Your SmartPay V2 application should now be live! Share your frontend URL with users.

**Quick Links Checklist:**
- ✅ Backend: `https://your-backend.onrender.com`
- ✅ Frontend: `https://your-frontend.vercel.app`
- ✅ Database: Supabase dashboard
- ✅ API Health: `https://your-backend.onrender.com/health`

---

## 🔄 Updating Your Deployment

When you make changes:
1. Push to GitHub
2. Vercel/Netlify auto-deploys frontend
3. Render auto-deploys backend
4. Both take 2-5 minutes

---

## 💡 Pro Tips

1. **Monitor Logs**: Check Render.com and Vercel/Netlify logs if issues arise
2. **Keep Backend Awake**: Use a service like [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 5 minutes
3. **Backup Database**: Export your Supabase database regularly from the dashboard
4. **Use Branch Deployments**: Vercel creates preview deployments for each branch automatically

Need help? Check the logs in your deployment platforms!

