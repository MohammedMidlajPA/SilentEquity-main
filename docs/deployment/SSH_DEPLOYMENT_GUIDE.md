# SSH VPS Deployment Guide - Silent Equity

Complete guide for deploying Silent Equity to Hostinger VPS via SSH.

## VPS Credentials

- **Host**: 72.60.108.234
- **User**: deployer
- **Password**: silentequitydeployer@0007
- **SSH Command**: `ssh deployer@72.60.108.234`

## Prerequisites

- ✅ SSH access to VPS
- ✅ Node.js installed on VPS (v18+)
- ✅ PM2 installed globally (`npm install -g pm2`)
- ✅ Nginx configured (if using reverse proxy)
- ✅ Environment variables prepared for production

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
cd scripts/deployment
chmod +x ssh-deploy.sh
./ssh-deploy.sh
```

This script will:
1. Build frontend
2. Create deployment archive
3. Connect to VPS
4. Backup old version
5. Stop application
6. Upload and extract new files
7. Install dependencies
8. Start application
9. Verify deployment

### Option 2: Interactive Deployment

```bash
cd scripts/deployment
chmod +x deploy-via-ssh.sh
./deploy-via-ssh.sh
```

This script provides step-by-step confirmation at each stage.

## Manual Deployment Steps

### Step 1: Prepare Deployment Package (Local)

```bash
# Build frontend
cd frontend
npm run build
cd ..

# Create deployment archive
cd scripts/deployment
./deploy-to-vps.sh
```

This creates:
- `.deploy/` directory with all files
- `silent-equity_TIMESTAMP.tar.gz` archive

### Step 2: Connect to VPS

```bash
ssh deployer@72.60.108.234
# Enter password: silentequitydeployer@0007
```

### Step 3: Navigate to Application Directory

Common locations:
- `/var/www/silent-equity`
- `/home/deployer/silent-equity`
- `/home/deployer/www/silent-equity`
- `/opt/silent-equity`

```bash
cd /home/deployer/silent-equity
# or wherever your app is located
```

### Step 4: Backup Old Version

```bash
# Create timestamped backup
BACKUP_DIR="silent-equity.backup.$(date +%Y%m%d_%H%M%S)"
cp -r . ../${BACKUP_DIR}
echo "Backup created: ../${BACKUP_DIR}"
```

### Step 5: Stop Application

```bash
# Stop PM2 process
pm2 stop silent-equity-backend
# or
pm2 stop all

# Verify stopped
pm2 status
```

### Step 6: Remove Old Files

```bash
# Remove old files (preserve .env and node_modules)
rm -rf backend/* frontend/dist/*
# Keep .env file if it exists
```

### Step 7: Upload Archive

From your local machine:

```bash
# Upload archive to VPS
scp silent-equity_TIMESTAMP.tar.gz deployer@72.60.108.234:/home/deployer/silent-equity/
```

### Step 8: Extract Archive

On VPS:

```bash
cd /home/deployer/silent-equity
tar -xzf silent-equity_TIMESTAMP.tar.gz
rm -f silent-equity_TIMESTAMP.tar.gz
```

### Step 9: Install Dependencies

```bash
cd backend
npm install --production
```

### Step 10: Update Environment Variables

```bash
# Edit .env file if needed
nano .env
```

**Required production variables:**
```env
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_SHEETS_WEBHOOK_URL=https://...
FORM_STORAGE_BACKEND=both
```

### Step 11: Start Application

```bash
# Start with PM2
pm2 start server.js --name "silent-equity-backend"

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

### Step 12: Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs silent-equity-backend

# Test health endpoint
curl http://localhost:5001/api/health
```

## SSH Commands Reference

### Connect to VPS
```bash
ssh deployer@72.60.108.234
```

### Check Application Status
```bash
pm2 status
pm2 logs silent-equity-backend
pm2 monit
```

### Restart Application
```bash
pm2 restart silent-equity-backend
# or
pm2 stop silent-equity-backend
pm2 start server.js --name "silent-equity-backend"
```

### View Logs
```bash
# Real-time logs
pm2 logs silent-equity-backend

# Last 100 lines
pm2 logs silent-equity-backend --lines 100

# Error logs only
pm2 logs silent-equity-backend --err
```

### Check Disk Space
```bash
df -h
du -sh /home/deployer/silent-equity/*
```

### Check Running Processes
```bash
ps aux | grep node
netstat -tulpn | grep 5001
```

## Rollback Procedure

If deployment fails or issues occur:

```bash
# Connect to VPS
ssh deployer@72.60.108.234

# Navigate to app directory
cd /home/deployer/silent-equity

# Stop current version
pm2 stop silent-equity-backend
pm2 delete silent-equity-backend

# Remove failed deployment
rm -rf backend frontend

# Restore from backup
BACKUP_DIR="silent-equity.backup.YYYYMMDD_HHMMSS"  # Use your backup timestamp
cp -r ../${BACKUP_DIR}/* .

# Restart application
cd backend
pm2 start server.js --name "silent-equity-backend"
pm2 save

# Verify
pm2 status
curl http://localhost:5001/api/health
```

## Troubleshooting

### SSH Connection Failed

```bash
# Test connectivity
ping 72.60.108.234

# Check SSH port
telnet 72.60.108.234 22

# Verbose SSH connection
ssh -v deployer@72.60.108.234
```

### Application Won't Start

```bash
# Check logs
pm2 logs silent-equity-backend --err

# Check environment variables
cd backend
cat .env

# Test database connection
node -e "require('./config/database').testConnection()"

# Check port availability
lsof -i :5001
```

### PM2 Process Not Found

```bash
# List all PM2 processes
pm2 list

# Start application manually first
cd backend
node server.js

# Then use PM2
pm2 start server.js --name "silent-equity-backend"
```

### Upload Failed

```bash
# Check disk space on VPS
df -h

# Check file permissions
ls -la /home/deployer/silent-equity

# Try manual upload via SFTP
sftp deployer@72.60.108.234
```

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --production

# Check Node.js version
node --version
npm --version
```

## Security Best Practices

1. **SSH Key Authentication** (Recommended)
   ```bash
   # Generate SSH key locally
   ssh-keygen -t rsa -b 4096
   
   # Copy to VPS
   ssh-copy-id deployer@72.60.108.234
   
   # Then disable password authentication in /etc/ssh/sshd_config
   ```

2. **Firewall Configuration**
   ```bash
   # Allow SSH
   sudo ufw allow 22/tcp
   
   # Allow application port (if not behind Nginx)
   sudo ufw allow 5001/tcp
   
   # Enable firewall
   sudo ufw enable
   ```

3. **Environment Variables**
   - Never commit `.env` files
   - Use strong passwords
   - Rotate keys regularly
   - Use production Stripe keys

4. **PM2 Security**
   - Run as non-root user
   - Set up log rotation
   - Monitor resource usage

## Monitoring

### Check Application Health

```bash
# Health endpoint
curl http://localhost:5001/api/health

# PM2 monitoring
pm2 monit

# System resources
htop
```

### Set Up Alerts

```bash
# PM2 ecosystem file for advanced configuration
pm2 ecosystem
```

## Next Steps After Deployment

1. ✅ Verify application is running
2. ✅ Test form submission
3. ✅ Test payment flow
4. ✅ Check Google Sheets integration
5. ✅ Monitor logs for errors
6. ✅ Set up SSL certificate (if not done)
7. ✅ Configure domain DNS
8. ✅ Set up backups

## Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs silent-equity-backend`
2. Check application logs in `backend/logs/`
3. Verify environment variables
4. Test database connectivity
5. Check Nginx configuration (if using)

## Deployment Checklist

- [ ] Frontend built successfully
- [ ] Deployment archive created
- [ ] SSH connection tested
- [ ] Old version backed up
- [ ] Application stopped
- [ ] Old files removed
- [ ] Archive uploaded
- [ ] Files extracted
- [ ] Dependencies installed
- [ ] Environment variables updated
- [ ] Application started
- [ ] Health check passed
- [ ] Logs checked
- [ ] Form submission tested
- [ ] Payment flow tested

**Ready to deploy!** 🚀




