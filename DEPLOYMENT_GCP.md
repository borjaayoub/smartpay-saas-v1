# Deploy to Google Cloud Platform (Free Tier)

This guide covers deploying your SmartPay V2 backend to GCP using the **free tier**.

⚠️ **Important**: GCP requires a credit card, but you get **$300 free credit** (valid 90 days) and many services have always-free tiers.

---

## 🎁 GCP Free Tier Benefits

- **$300 credit** for 90 days (new accounts)
- **App Engine**: Always free tier (28 hours/day)
- **Cloud SQL**: No always-free tier (but small instances are cheap)
- **Compute Engine**: Always free: 1 f1-micro instance/month (limited regions)
- **Cloud Run**: 2 million requests/month free

---

## 📋 Prerequisites

1. Google Cloud account (credit card for $300 credit)
2. Google Cloud CLI installed
3. Your code on GitHub

---

## 🚀 Option A: Cloud Run (Recommended - Serverless)

**Best for**: Easy deployment, auto-scaling, pay-per-use

### Step 1: Install Google Cloud CLI

```bash
# Windows: Download installer from
# https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version
```

### Step 2: Create Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8080

# Set environment
ENV PORT=8080
ENV FLASK_ENV=production

# Run gunicorn
CMD exec gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

### Step 3: Authenticate & Setup

```bash
# Login
gcloud auth login

# Create project
gcloud projects create smartpay-v2 --name="SmartPay V2"

# Set current project
gcloud config set project smartpay-v2

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### Step 4: Build & Deploy

```bash
cd backend

# Build container
gcloud builds submit --tag gcr.io/smartpay-v2/smartpay-backend

# Deploy to Cloud Run
gcloud run deploy smartpay-backend \
  --image gcr.io/smartpay-v2/smartpay-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars FLASK_ENV=production \
  --set-env-vars PORT=8080
```

### Step 5: Set Environment Variables

```bash
gcloud run services update smartpay-backend \
  --set-env-vars DATABASE_URL=your-supabase-url \
  --set-env-vars SECRET_KEY=your-secret-key \
  --set-env-vars JWT_SECRET_KEY=your-jwt-secret-key \
  --set-env-vars CORS_ORIGINS=https://your-frontend.vercel.app \
  --set-env-vars JWT_COOKIE_SECURE=True \
  --set-env-vars JWT_COOKIE_SAMESITE=None \
  --region us-central1
```

### Step 6: Initialize Database

```bash
# Get service URL
gcloud run services describe smartpay-backend --region us-central1

# Run init script (use Cloud Shell or local)
# Option 1: Use Cloud Shell
gcloud shell

# Option 2: Run locally with DATABASE_URL set
export DATABASE_URL=your-supabase-url
cd backend
python init_db.py
```

### Step 7: Your URL

```bash
gcloud run services describe smartpay-backend --region us-central1 --format 'value(status.url)'
```

**Cost**: Free for 2 million requests/month! 🎉

---

## ☁️ Option B: App Engine (Traditional)

### Step 1: Create app.yaml

Create `backend/app.yaml`:

```yaml
runtime: python311

env_variables:
  FLASK_ENV: production
  PORT: 8080

entrypoint: gunicorn main:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120

automatic_scaling:
  min_instances: 1
  max_instances: 2
  target_cpu_utilization: 0.6

instance_class: F1  # Free tier eligible
```

### Step 2: Deploy

```bash
cd backend
gcloud app create --region us-central1
gcloud app deploy
```

### Step 3: Set Environment Variables

```bash
gcloud app deploy --env-vars DATABASE_URL=your-supabase-url,SECRET_KEY=your-secret-key,JWT_SECRET_KEY=your-jwt-secret-key
```

### Step 4: Your URL

```bash
gcloud app browse
```

**Cost**: Free tier: 28 hours/day of F1 instances

---

## 💻 Option C: Compute Engine (VM - More Control)

### Step 1: Create VM

```bash
# Create instance
gcloud compute instances create smartpay-backend \
  --zone=us-central1-a \
  --machine-type=f1-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB

# Create firewall rule
gcloud compute firewall-rules create allow-http \
  --allow tcp:80,tcp:443,tcp:5000 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow HTTP/HTTPS"
```

### Step 2: SSH into VM

```bash
gcloud compute ssh smartpay-backend --zone us-central1-a
```

### Step 3: Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install python3.11 python3.11-venv python3-pip nginx -y
sudo apt install libpq-dev python3-dev -y
```

### Step 4: Setup Application

```bash
# Clone repo
git clone https://github.com/yourusername/smartpay-v2.git
cd smartpay-v2/backend

# Create venv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
nano .env
# Add your environment variables

# Initialize database
python init_db.py
```

### Step 5: Create Systemd Service

```bash
sudo nano /etc/systemd/system/smartpay.service
```

Add:
```ini
[Unit]
Description=SmartPay Flask App
After=network.target

[Service]
User=your-username
WorkingDirectory=/home/your-username/smartpay-v2/backend
Environment="PATH=/home/your-username/smartpay-v2/backend/venv/bin"
ExecStart=/home/your-username/smartpay-v2/backend/venv/bin/gunicorn main:app --bind 0.0.0.0:5000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl start smartpay
sudo systemctl enable smartpay
```

### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/smartpay
```

Add:
```nginx
server {
    listen 80;
    server_name your-external-ip;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/smartpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: Get External IP

```bash
gcloud compute instances describe smartpay-backend --zone us-central1-a --format 'get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Cost**: f1-micro is always free (1 per month, limited regions)

---

## 🗄️ Option D: Cloud SQL PostgreSQL (Alternative to Supabase)

### Step 1: Create Database

```bash
gcloud sql instances create smartpay-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=your-secure-password
```

### Step 2: Create Database

```bash
gcloud sql databases create smartpay_db --instance=smartpay-db
```

### Step 3: Get Connection String

```bash
gcloud sql instances describe smartpay-db --format 'value(connectionName)'
```

Connection string format:
```
postgresql://postgres:password@/smartpay_db?host=/cloudsql/PROJECT_ID:REGION:smartpay-db
```

**Cost**: db-f1-micro is not always free, but very cheap (~$7/month) or use Supabase (free)

---

## ✅ Verify Deployment

1. Test health endpoint
2. Check logs: `gcloud run services logs read smartpay-backend` (Cloud Run)
3. Or: `gcloud app logs tail -s default` (App Engine)

---

## 💰 Cost Management

**Free Tier:**
- **Cloud Run**: 2M requests/month free
- **App Engine**: 28 hours/day F1 instances free
- **Compute Engine**: 1 f1-micro/month free (limited regions)
- **$300 credit** for 90 days

**After Free Tier:**
- Cloud Run: Very cheap (pay per request)
- App Engine: ~$0.05/hour for F1 (cheap)
- Compute Engine f1-micro: ~$6/month

**Tips:**
- Use Cloud Run for best free tier
- Use Supabase instead of Cloud SQL
- Monitor GCP Billing Dashboard
- Set up billing alerts

---

## 🔒 Security Best Practices

1. Enable **Cloud Armor** for DDoS protection
2. Use **IAM** with minimal permissions
3. Enable **MFA** on account
4. Set up **billing alerts**
5. Use **VPC** for Compute Engine if needed

---

## 📊 Comparison: GCP Options

| Option | Free Tier | Difficulty | Best For |
|--------|-----------|------------|----------|
| **Cloud Run** | 2M requests/month | ⭐ Easy | Serverless, auto-scale |
| **App Engine** | 28 hrs/day | ⭐ Easy | Traditional apps |
| **Compute Engine** | 1 f1-micro/month | ⭐⭐ Medium | Full control |
| **Cloud SQL** | None (but cheap) | ⭐⭐ Medium | Managed DB |

---

## 🎯 Recommended Setup

1. **Backend**: Cloud Run (Option A) - best free tier
2. **Frontend**: Vercel (not GCP, but free)
3. **Database**: Supabase (free forever)

This gives you **$0 cost** and excellent performance!

---

## 📚 Additional Resources

- GCP Free Tier: https://cloud.google.com/free
- Cloud Run Docs: https://cloud.google.com/run/docs
- App Engine Docs: https://cloud.google.com/appengine/docs

---

## ⚠️ Important Notes

1. **Billing**: GCP requires credit card, but you can set budget alerts
2. **Free Tier**: Many services have always-free tiers beyond the $300 credit
3. **Regions**: Free tier may be limited to certain regions (us-central1, etc.)
4. **Monitor**: Always check GCP Billing Dashboard regularly

---

Need help? Check GCP documentation or use Cloud Shell for easy setup!

