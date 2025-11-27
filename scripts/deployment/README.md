# Deployment Scripts

Scripts for deploying Silent Equity to Hostinger VPS via SSH.

## Available Scripts

### 1. `ssh-deploy.sh` - Automated Deployment

Fully automated deployment script that handles the entire deployment process.

**Usage:**
```bash
cd scripts/deployment
./ssh-deploy.sh
```

**Features:**
- Builds frontend automatically
- Creates deployment archive
- Connects to VPS automatically
- Backs up old version
- Stops application
- Uploads and extracts files
- Installs dependencies
- Starts application
- Verifies deployment

**Requirements:**
- `sshpass` (optional, for automated password entry)
  - macOS: `brew install sshpass`
  - Linux: `apt-get install sshpass` or `yum install sshpass`

**VPS Credentials:**
- Host: 72.60.108.234
- User: deployer
- Password: silentequitydeployer@0007

### 2. `deploy-via-ssh.sh` - Interactive Deployment

Step-by-step interactive deployment with manual confirmation at each stage.

**Usage:**
```bash
cd scripts/deployment
./deploy-via-ssh.sh
```

**Features:**
- Interactive confirmation at each step
- Manual password entry (no sshpass required)
- Step-by-step progress display
- Rollback instructions provided

### 3. `deploy-to-vps.sh` - Prepare Package Only

Prepares deployment package without deploying. Use this if you want to deploy manually.

**Usage:**
```bash
cd scripts/deployment
./deploy-to-vps.sh
```

**Output:**
- Creates `.deploy/` directory
- Creates `silent-equity_TIMESTAMP.tar.gz` archive
- Shows deployment summary

## Quick Start

### Automated Deployment (Recommended)

```bash
# Make scripts executable (first time only)
chmod +x scripts/deployment/*.sh

# Run automated deployment
cd scripts/deployment
./ssh-deploy.sh
```

### Interactive Deployment

```bash
cd scripts/deployment
./deploy-via-ssh.sh
```

## Deployment Process

1. **Prepare Package** - Builds frontend and creates archive
2. **Connect to VPS** - Establishes SSH connection
3. **Backup** - Creates timestamped backup of old version
4. **Stop App** - Stops PM2 processes
5. **Clean** - Removes old files
6. **Upload** - Uploads new archive via SCP
7. **Extract** - Extracts archive on VPS
8. **Install** - Installs npm dependencies
9. **Start** - Starts application with PM2
10. **Verify** - Checks PM2 status and health endpoint

## VPS Configuration

The scripts automatically detect the application directory. Common locations checked:
- `/var/www/silent-equity`
- `/home/deployer/silent-equity`
- `/home/deployer/www/silent-equity`
- `/opt/silent-equity`

## Troubleshooting

### SSH Connection Issues

```bash
# Test connection manually
ssh deployer@72.60.108.234

# Check if sshpass is installed
which sshpass

# Install sshpass (macOS)
brew install sshpass

# Install sshpass (Linux)
sudo apt-get install sshpass
```

### Script Permission Issues

```bash
# Make scripts executable
chmod +x scripts/deployment/*.sh
```

### Deployment Fails

1. Check VPS connectivity: `ping 72.60.108.234`
2. Verify SSH access: `ssh deployer@72.60.108.234`
3. Check disk space on VPS: `df -h`
4. Review PM2 logs: `pm2 logs silent-equity-backend`

## Manual Deployment

If scripts don't work, follow the manual steps in:
- `docs/deployment/SSH_DEPLOYMENT_GUIDE.md`

## Rollback

If deployment fails:

```bash
ssh deployer@72.60.108.234
cd /home/deployer/silent-equity  # or your app directory
pm2 stop silent-equity-backend
rm -rf backend frontend
cp -r ../silent-equity.backup.TIMESTAMP/* .
cd backend
pm2 start server.js --name "silent-equity-backend"
```

## Support

For detailed instructions, see:
- `docs/deployment/SSH_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `docs/deployment/VPS_DEPLOYMENT_GUIDE.md` - General VPS deployment guide




