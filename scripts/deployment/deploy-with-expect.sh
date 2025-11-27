#!/bin/bash

# 🚀 SSH Deployment Script using Expect for Password Handling
# Requires: expect (install with: brew install expect)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# VPS Configuration
VPS_HOST="72.60.108.234"
VPS_USER="deployer"
VPS_PASSWORD="silentequitydeployer@0007"
VPS_SSH="${VPS_USER}@${VPS_HOST}"

# Project Configuration
PROJECT_NAME="silent-equity"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}🚀 Silent Equity - SSH Deployment (Expect)${NC}"
echo "=========================================="
echo ""

# Check if expect is installed
if ! command -v expect &> /dev/null; then
    echo -e "${RED}❌ expect is not installed!${NC}"
    echo -e "${YELLOW}Install with: brew install expect${NC}"
    exit 1
fi

# Check if archive exists
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"
if [ ! -f "$ARCHIVE_NAME" ]; then
    echo -e "${YELLOW}📦 Preparing deployment package...${NC}"
    cd /Users/mohammedmidlajpa/Downloads/SilentEquity-main
    scripts/deployment/deploy-to-vps.sh <<< "yes"
    ARCHIVE_NAME=$(ls -t ${PROJECT_NAME}_*.tar.gz | head -1)
    echo -e "${GREEN}✅ Archive ready: ${ARCHIVE_NAME}${NC}"
fi

ARCHIVE_PATH="$(pwd)/${ARCHIVE_NAME}"
ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)

echo -e "${BLUE}Deployment Details:${NC}"
echo "  Archive: ${ARCHIVE_NAME}"
echo "  Size: ${ARCHIVE_SIZE}"
echo "  VPS: ${VPS_SSH}"
echo ""

read -p "Proceed with deployment? (yes/no): " APPROVAL
if [ "$APPROVAL" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

# Create expect script for SCP upload
cat > /tmp/deploy_scp.exp << 'EOFSCRIPT'
#!/usr/bin/expect -f
set timeout 300
set host [lindex $argv 0]
set user [lindex $argv 1]
set password [lindex $argv 2]
set archive [lindex $argv 3]
set remote_path [lindex $argv 4]

spawn scp -o StrictHostKeyChecking=no "$archive" "${user}@${host}:${remote_path}/"
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Permission denied" {
        puts "ERROR: Authentication failed"
        exit 1
    }
    eof
}
wait
EOFSCRIPT

chmod +x /tmp/deploy_scp.exp

# Create expect script for SSH commands
cat > /tmp/deploy_ssh.exp << 'EOFSCRIPT'
#!/usr/bin/expect -f
set timeout 300
set host [lindex $argv 0]
set user [lindex $argv 1]
set password [lindex $argv 2]
set commands [lindex $argv 3]

spawn ssh -o StrictHostKeyChecking=no "${user}@${host}" "$commands"
expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Permission denied" {
        puts "ERROR: Authentication failed"
        exit 1
    }
    eof
}
wait
EOFSCRIPT

chmod +x /tmp/deploy_ssh.exp

# Detect app directory
echo -e "${YELLOW}🔍 Detecting application directory...${NC}"
APP_DIRS=("/var/www/${PROJECT_NAME}" "/home/${VPS_USER}/${PROJECT_NAME}" "/home/${VPS_USER}/www/${PROJECT_NAME}" "/opt/${PROJECT_NAME}")
APP_DIR=""

for dir in "${APP_DIRS[@]}"; do
    echo "  Checking: $dir"
    if /tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "test -d $dir && echo 'EXISTS'" 2>/dev/null | grep -q "EXISTS"; then
        APP_DIR="$dir"
        echo -e "${GREEN}✅ Found: ${APP_DIR}${NC}"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    APP_DIR="/home/${VPS_USER}/${PROJECT_NAME}"
    echo -e "${YELLOW}⚠️  Creating directory: ${APP_DIR}${NC}"
    /tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "mkdir -p ${APP_DIR}" || true
fi

# Backup
echo -e "${YELLOW}💾 Backing up old version...${NC}"
BACKUP_DIR="${APP_DIR}.backup.${TIMESTAMP}"
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "if [ -d ${APP_DIR} ] && [ \"\$(ls -A ${APP_DIR} 2>/dev/null)\" ]; then cp -r ${APP_DIR} ${BACKUP_DIR} && echo 'BACKUP_OK'; else echo 'NO_BACKUP'; fi" | grep -q "BACKUP_OK" && echo -e "${GREEN}✅ Backup created${NC}" || echo -e "${YELLOW}⚠️  No existing files to backup${NC}"

# Stop app
echo -e "${YELLOW}🛑 Stopping application...${NC}"
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "cd ${APP_DIR}/backend 2>/dev/null && (pm2 stop silent-equity-backend 2>/dev/null || pm2 stop all 2>/dev/null || echo 'NO_PM2') || echo 'NO_BACKEND'" | grep -q "NO" && echo -e "${YELLOW}⚠️  No PM2 process found${NC}" || echo -e "${GREEN}✅ Application stopped${NC}"

# Upload
echo -e "${YELLOW}📤 Uploading archive...${NC}"
/tmp/deploy_scp.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "$ARCHIVE_PATH" "$APP_DIR" || {
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Archive uploaded${NC}"

# Extract
echo -e "${YELLOW}📦 Extracting files...${NC}"
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "cd ${APP_DIR} && rm -rf backend/* frontend/dist/* 2>/dev/null || true && tar -xzf ${ARCHIVE_NAME} && rm -f ${ARCHIVE_NAME} && echo 'EXTRACT_OK'" | grep -q "EXTRACT_OK" && echo -e "${GREEN}✅ Files extracted${NC}" || {
    echo -e "${RED}❌ Extraction failed!${NC}"
    exit 1
}

# Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "cd ${APP_DIR}/backend && npm install --production && echo 'INSTALL_OK'" | grep -q "INSTALL_OK" && echo -e "${GREEN}✅ Dependencies installed${NC}" || {
    echo -e "${RED}❌ Installation failed!${NC}"
    exit 1
}

# Start app
echo -e "${YELLOW}🚀 Starting application...${NC}"
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "cd ${APP_DIR}/backend && pm2 start server.js --name 'silent-equity-backend' --update-env && pm2 save && echo 'START_OK'" | grep -q "START_OK" && echo -e "${GREEN}✅ Application started${NC}" || {
    echo -e "${YELLOW}⚠️  Trying alternative start method...${NC}"
    /tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "cd ${APP_DIR}/backend && pm2 restart silent-equity-backend || pm2 start server.js --name 'silent-equity-backend'" || true
}

# Verify
echo -e "${YELLOW}✅ Verifying deployment...${NC}"
sleep 2
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "pm2 status"
echo ""
/tmp/deploy_ssh.exp "$VPS_HOST" "$VPS_USER" "$VPS_PASSWORD" "curl -s http://localhost:5001/api/health || echo 'HEALTH_CHECK_FAILED'"

# Cleanup
rm -f /tmp/deploy_scp.exp /tmp/deploy_ssh.exp

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  VPS: ${VPS_SSH}"
echo "  Directory: ${APP_DIR}"
echo "  Backup: ${BACKUP_DIR}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  ssh ${VPS_SSH} 'pm2 logs silent-equity-backend'"
echo "  ssh ${VPS_SSH} 'pm2 status'"
echo "  ssh ${VPS_SSH} 'curl http://localhost:5001/api/health'"
echo ""




