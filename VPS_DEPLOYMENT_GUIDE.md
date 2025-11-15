# 🚀 VPS Deployment Guide - Silent Equity

## Overview

This guide walks you through deploying Silent Equity to your Hostinger VPS with an approval-based workflow.

## Prerequisites

- ✅ Hostinger VPS purchased and active
- ✅ Hostinger MCP configured and working
- ✅ Node.js installed on VPS
- ✅ MongoDB connection string ready
- ✅ Stripe keys (test or production) ready
- ✅ Environment variables prepared

## Deployment Workflow

### Step 1: Prepare Deployment Package

Run the deployment preparation script:

```bash
chmod +x deploy-to-vps.sh
./deploy-to-vps.sh
```

This script will:
- ✅ Build the frontend
- ✅ Prepare deployment package
- ✅ Show deployment summary
- ✅ **Request your approval before proceeding**
- ✅ Create deployment archive

### Step 2: Review Deployment Package

The script creates:
- `.deploy/` directory with all files
- `silent-equity_TIMESTAMP.tar.gz` archive

**Review before approving:**
- Check file sizes
- Verify all necessary files are included
- Confirm environment variables are ready

### Step 3: Approval Required

The script will ask:
```
Do you want to proceed with deployment? (yes/no):
```

**Only type "yes" to proceed!**

### Step 4: Deploy to VPS

After approval, you have two options:

#### Option A: Using Hostinger MCP (Recommended)

1. **List your VPS instances:**
   ```bash
   # Check available VPS instances via MCP
   ```

2. **Upload deployment archive:**
   - Use Hostinger MCP to upload the archive
   - Or use SCP/SFTP manually

3. **Extract and deploy:**
   ```bash
   # On VPS
   tar -xzf silent-equity_TIMESTAMP.tar.gz
   cd silent-equity
   ```

#### Option B: Manual Deployment

1. **SSH into your VPS**
2. **Upload archive** (via SCP/SFTP)
3. **Extract archive**
4. **Install dependencies**
5. **Configure environment**
6. **Start application**

## VPS Setup Steps

### 1. Connect to VPS

```bash
ssh root@your-vps-ip
# or
ssh username@your-vps-ip
```

### 2. Install Node.js (if not installed)

```bash
# Using NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 3. Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 4. Upload and Extract Deployment

```bash
# Create app directory
mkdir -p /var/www/silent-equity
cd /var/www/silent-equity

# Upload archive (from local machine)
scp silent-equity_TIMESTAMP.tar.gz root@your-vps-ip:/var/www/silent-equity/

# Extract
tar -xzf silent-equity_TIMESTAMP.tar.gz
```

### 5. Install Dependencies

```bash
# Backend
cd backend
npm install --production

# Frontend (if needed)
cd ../frontend
npm install --production
```

### 6. Configure Environment Variables

```bash
# Backend .env
cd /var/www/silent-equity/backend
nano .env
```

**Required variables:**
```env
PORT=5001
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://yourdomain.com
WEBINAR_PRICE=4.5
EMAIL_HOST=smtp.example.com
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=Your Name <email@example.com>
```

### 7. Set Up Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt-get install nginx

# Create config
sudo nano /etc/nginx/sites-available/silent-equity
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/silent-equity/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/silent-equity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 9. Start Application with PM2

```bash
cd /var/www/silent-equity/backend

# Start backend
pm2 start server.js --name "silent-equity-backend"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### 10. Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs silent-equity-backend

# Test API
curl http://localhost:5001/api/health
```

## Removing Old Files

Before deploying new version:

```bash
# On VPS
cd /var/www/silent-equity

# Stop application
pm2 stop silent-equity-backend
pm2 delete silent-equity-backend

# Backup old files (optional)
mv backend backend.old.$(date +%Y%m%d)
mv frontend frontend.old.$(date +%Y%m%d)

# Extract new deployment
tar -xzf silent-equity_NEW_TIMESTAMP.tar.gz

# Restart application
cd backend
pm2 start server.js --name "silent-equity-backend"
```

## Approval Workflow

The deployment script includes an approval step:

1. **Shows deployment summary** - What will be deployed
2. **Lists files** - What files are included
3. **Shows size** - Total deployment size
4. **Requests approval** - Must type "yes" to proceed
5. **Creates archive** - Only after approval

**Safety Features:**
- ✅ No automatic deployment
- ✅ User must explicitly approve
- ✅ Shows what will be removed
- ✅ Creates backup-friendly archives

## Monitoring

### Check Application Status

```bash
pm2 status
pm2 logs silent-equity-backend
pm2 monit
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
```

### Check Disk Space

```bash
df -h
du -sh /var/www/silent-equity/*
```

## Troubleshooting

### Application Not Starting

```bash
# Check logs
pm2 logs silent-equity-backend

# Check environment variables
cd /var/www/silent-equity/backend
cat .env

# Test database connection
node -e "require('mongoose').connect(process.env.MONGODB_URI)"
```

### Nginx Errors

```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Port Already in Use

```bash
# Check what's using port 5001
sudo lsof -i :5001

# Kill process if needed
sudo kill -9 PID
```

## Rollback Plan

If deployment fails:

```bash
# Stop new version
pm2 stop silent-equity-backend
pm2 delete silent-equity-backend

# Restore old version
cd /var/www/silent-equity
rm -rf backend frontend
mv backend.old.YYYYMMDD backend
mv frontend.old.YYYYMMDD frontend

# Restart
cd backend
pm2 start server.js --name "silent-equity-backend"
```

## Security Checklist

- [ ] Environment variables secured (not in Git)
- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] SSH key authentication enabled
- [ ] Regular backups configured
- [ ] PM2 auto-restart enabled
- [ ] Log rotation configured
- [ ] Rate limiting enabled

## Next Steps

1. ✅ Run `./deploy-to-vps.sh` to prepare deployment
2. ✅ Review deployment package
3. ✅ Approve deployment
4. ✅ Upload to VPS
5. ✅ Configure environment variables
6. ✅ Set up Nginx and SSL
7. ✅ Start application with PM2
8. ✅ Verify deployment

**Ready to deploy!** 🚀

