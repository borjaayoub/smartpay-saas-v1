# Deploy to AWS Free Tier

This guide covers deploying your SmartPay V2 backend to AWS using the **free tier**. 

⚠️ **Important**: AWS requires a credit card, but you won't be charged if you stay within free tier limits.

---

## 🎁 AWS Free Tier Benefits

- **EC2**: 750 hours/month of t2.micro (1 year free)
- **RDS PostgreSQL**: 750 hours/month db.t2.micro (1 year free)
- **Elastic Beanstalk**: Free (pay only for underlying resources)
- **After 1 year**: Still free if you use minimal resources carefully

---

## 📋 Prerequisites

1. AWS account (credit card required for verification)
2. AWS CLI installed
3. Your code on GitHub

---

## 🗄️ Option A: AWS Elastic Beanstalk (Easiest)

### Step 1: Install AWS CLI & EB CLI

```bash
# Install AWS CLI (if not installed)
# Windows: Download from aws.amazon.com/cli

# Install EB CLI
pip install awsebcli --upgrade --user
```

### Step 2: Configure AWS Credentials

```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: us-east-1 (or closest to you)
# Default output: json
```

Get credentials from: AWS Console → IAM → Users → Your User → Security Credentials

### Step 3: Initialize EB Application

```bash
cd backend
eb init
# Select region
# Select "Python"
# Select Python 3.11
# Do NOT set up SSH (skip for now)
```

### Step 4: Create .ebextensions/config.config

Create `backend/.ebextensions/01_python.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: main:app
  aws:elasticbeanstalk:application:environment:
    FLASK_ENV: production
    PYTHONPATH: "/var/app/current:$PYTHONPATH"
```

### Step 5: Create .ebextensions/02_database.config

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    DATABASE_URL: 'Set this via EB environment variables'
```

### Step 6: Create Application

```bash
eb create smartpay-backend
# Select t2.micro (free tier eligible)
# Wait 5-10 minutes
```

### Step 7: Set Environment Variables

```bash
eb setenv DATABASE_URL=your-supabase-url
eb setenv SECRET_KEY=your-secret-key
eb setenv JWT_SECRET_KEY=your-jwt-secret-key
eb setenv CORS_ORIGINS=https://your-frontend.vercel.app
eb setenv FLASK_ENV=production
eb setenv JWT_COOKIE_SECURE=True
eb setenv JWT_COOKIE_SAMESITE=None
```

### Step 8: Initialize Database

```bash
eb ssh
cd /var/app/current
python init_db.py
exit
```

### Step 9: Your URL

```bash
eb status
# Copy the CNAME URL
```

---

## ☁️ Option B: AWS EC2 (More Control)

### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. **Launch Instance**
3. Configure:
   - **Name**: `smartpay-backend`
   - **AMI**: Ubuntu 22.04 LTS (Free tier eligible)
   - **Instance type**: t2.micro (Free tier)
   - **Key pair**: Create new (save the .pem file!)
   - **Network**: Default VPC
   - **Security Group**: 
     - Allow SSH (port 22) from your IP
     - Allow HTTP (port 80) from anywhere
     - Allow HTTPS (port 443) from anywhere
     - Allow Custom TCP (port 5000) from anywhere (or just your IP)
4. **Launch Instance**

### Step 2: Connect to EC2

```bash
# Windows (using WSL or Git Bash)
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Or use PuTTY (Windows)
```

### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL client (for psycopg2)
sudo apt install libpq-dev python3-dev -y

# Install Nginx (reverse proxy)
sudo apt install nginx -y
```

### Step 4: Clone & Setup App

```bash
# Clone your repo
git clone https://github.com/yourusername/smartpay-v2.git
cd smartpay-v2/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 5: Configure Environment

```bash
# Create .env file
nano .env
```

Add:
```
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=your-supabase-url
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
JWT_COOKIE_SECURE=True
JWT_COOKIE_SAMESITE=None
CORS_ORIGINS=https://your-frontend.vercel.app
PORT=5000
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 6: Create Systemd Service

```bash
sudo nano /etc/systemd/system/smartpay.service
```

Add:
```ini
[Unit]
Description=SmartPay Flask App
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/smartpay-v2/backend
Environment="PATH=/home/ubuntu/smartpay-v2/backend/venv/bin"
ExecStart=/home/ubuntu/smartpay-v2/backend/venv/bin/gunicorn main:app --bind 0.0.0.0:5000 --workers 2
Restart=always

[Install]
WantedBy=multi-user.target
```

### Step 7: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/smartpay
```

Add:
```nginx
server {
    listen 80;
    server_name your-ec2-ip-or-domain;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/smartpay /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 8: Start Service

```bash
# Initialize database
cd /home/ubuntu/smartpay-v2/backend
source venv/bin/activate
python init_db.py

# Start service
sudo systemctl start smartpay
sudo systemctl enable smartpay

# Check status
sudo systemctl status smartpay
```

### Step 9: Get Your URL

Your backend is at: `http://your-ec2-public-ip`

For HTTPS (recommended), use AWS Certificate Manager + Route 53, or use Cloudflare (free).

---

## 🗄️ Option C: AWS RDS PostgreSQL (Alternative to Supabase)

1. AWS Console → RDS → Create Database
2. Select **PostgreSQL**
3. **Free tier**: Select db.t2.micro
4. Configure:
   - Instance: db.t2.micro
   - Storage: 20 GB (free tier)
   - Master username: postgres
   - Master password: (save this!)
5. Create
6. Wait 5 minutes, then get endpoint URL
7. Connection string: `postgresql://postgres:password@your-rds-endpoint:5432/smartpay_db`

---

## ✅ Verify Deployment

1. Test health: `http://your-aws-url/health`
2. Check logs: `eb logs` (EB) or `sudo journalctl -u smartpay -f` (EC2)

---

## 💰 Cost Management

**Free Tier (First 12 Months):**
- EC2 t2.micro: 750 hours/month
- RDS db.t2.micro: 750 hours/month
- Total: **$0** if within limits

**After 12 Months:**
- t2.micro: ~$8-10/month if running 24/7
- Minimal usage can still be free

**Tips to Stay Free:**
- Use t2.micro instances
- Stop instances when not in use
- Use Supabase instead of RDS (free forever)
- Monitor AWS Billing Dashboard

---

## 🔒 Security Best Practices

1. **Never commit .pem files**
2. **Use Security Groups** to restrict access
3. **Enable MFA** on AWS account
4. **Set up billing alerts**
5. **Use IAM roles** with minimal permissions

---

## 📚 Additional Resources

- AWS Free Tier: https://aws.amazon.com/free/
- EB Documentation: https://docs.aws.amazon.com/elasticbeanstalk/
- EC2 Documentation: https://docs.aws.amazon.com/ec2/

---

## 🎯 Quick Recommendation

For easiest AWS deployment:
1. Use **Elastic Beanstalk** (Option A) - automatic scaling, easy updates
2. Use **Supabase** for database (free forever, no RDS needed)
3. Use **CloudFront** (optional, free tier) for CDN

This keeps costs at **$0** and simplifies deployment!

