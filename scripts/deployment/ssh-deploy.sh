#!/bin/bash

# 🚀 Automated SSH VPS Deployment Script
# Deploys Silent Equity to Hostinger VPS via SSH

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="72.60.108.234"
VPS_USER="deployer"
VPS_PASSWORD="silentequitydeployer@0007"
VPS_SSH="${VPS_USER}@${VPS_HOST}"

# Project Configuration
PROJECT_NAME="silent-equity"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
DEPLOY_DIR=".deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}🚀 Silent Equity - SSH VPS Deployment${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}VPS: ${VPS_SSH}${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found!${NC}"
    exit 1
fi

# Check if sshpass is installed (optional, for automated password entry)
if command -v sshpass &> /dev/null; then
    USE_SSHPASS=true
    echo -e "${GREEN}✅ sshpass found - will use for automated password entry${NC}"
else
    USE_SSHPASS=false
    echo -e "${YELLOW}⚠️  sshpass not found - you'll need to enter password manually${NC}"
    echo -e "${YELLOW}   Install with: brew install sshpass (macOS) or apt-get install sshpass (Linux)${NC}"
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 2: Build frontend
echo -e "${YELLOW}📦 Step 2: Building frontend...${NC}"
cd "$FRONTEND_DIR"
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 3: Prepare deployment package
echo -e "${YELLOW}📦 Step 3: Preparing deployment package...${NC}"

# Create deployment directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy backend files (excluding node_modules, .env, logs)
echo "  📁 Copying backend files..."
rsync -av --exclude='node_modules' --exclude='.env' --exclude='*.log' --exclude='.git' \
    "$BACKEND_DIR/" "$DEPLOY_DIR/backend/"

# Copy frontend build
echo "  📁 Copying frontend build..."
cp -r "$FRONTEND_DIR/dist" "$DEPLOY_DIR/frontend/"

# Copy package.json files for installation
cp "$BACKEND_DIR/package.json" "$DEPLOY_DIR/backend/"
cp "$FRONTEND_DIR/package.json" "$DEPLOY_DIR/frontend/"

# Create deployment info file
cat > "$DEPLOY_DIR/DEPLOY_INFO.txt" << EOF
Deployment Information
=====================
Project: Silent Equity
Timestamp: $TIMESTAMP
Backend: Node.js/Express
Frontend: React/Vite
Build Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
VPS: ${VPS_SSH}
EOF

echo -e "${GREEN}✅ Deployment package prepared${NC}"
echo ""

# Step 4: Create deployment archive
echo -e "${YELLOW}📦 Step 4: Creating deployment archive...${NC}"
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"
cd "$DEPLOY_DIR"
tar -czf "../$ARCHIVE_NAME" .
cd ..
echo -e "${GREEN}✅ Archive created: $ARCHIVE_NAME${NC}"
ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
echo -e "${BLUE}   Archive size: ${ARCHIVE_SIZE}${NC}"
echo ""

# Step 5: Detect VPS app directory
echo -e "${YELLOW}🔍 Step 5: Detecting VPS application directory...${NC}"

# Try common locations
APP_DIRS=(
    "/var/www/${PROJECT_NAME}"
    "/home/${VPS_USER}/${PROJECT_NAME}"
    "/home/${VPS_USER}/www/${PROJECT_NAME}"
    "/opt/${PROJECT_NAME}"
)

if [ "$USE_SSHPASS" = true ]; then
    SSH_CMD="sshpass -p '${VPS_PASSWORD}' ssh -o StrictHostKeyChecking=no ${VPS_SSH}"
    SCP_CMD="sshpass -p '${VPS_PASSWORD}' scp -o StrictHostKeyChecking=no"
else
    SSH_CMD="ssh -o StrictHostKeyChecking=no ${VPS_SSH}"
    SCP_CMD="scp -o StrictHostKeyChecking=no"
fi

APP_DIR=""
for dir in "${APP_DIRS[@]}"; do
    echo "  Checking: $dir"
    if $SSH_CMD "test -d $dir" 2>/dev/null; then
        APP_DIR="$dir"
        echo -e "${GREEN}✅ Found existing deployment at: ${APP_DIR}${NC}"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    # Use first directory as default
    APP_DIR="${APP_DIRS[1]}"
    echo -e "${YELLOW}⚠️  No existing deployment found, will use: ${APP_DIR}${NC}"
    echo -e "${YELLOW}   Creating directory on VPS...${NC}"
    $SSH_CMD "mkdir -p ${APP_DIR}" || true
fi

echo ""

# Step 6: Request approval
echo -e "${RED}⚠️  DEPLOYMENT APPROVAL REQUIRED${NC}"
echo "=========================================="
echo ""
echo "This will:"
echo "  1. Connect to VPS: ${VPS_SSH}"
echo "  2. Backup existing files (if any)"
echo "  3. Stop running application (PM2)"
echo "  4. Upload and extract new deployment"
echo "  5. Install dependencies"
echo "  6. Restart application"
echo ""
echo -e "${YELLOW}Application directory: ${APP_DIR}${NC}"
echo ""
read -p "Do you want to proceed with deployment? (yes/no): " APPROVAL

if [ "$APPROVAL" != "yes" ]; then
    echo -e "${YELLOW}❌ Deployment cancelled by user${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Approval received! Proceeding with deployment...${NC}"
echo ""

# Step 7: Backup old version
echo -e "${YELLOW}💾 Step 7: Backing up old version...${NC}"
BACKUP_DIR="${APP_DIR}.backup.${TIMESTAMP}"
$SSH_CMD "if [ -d ${APP_DIR} ]; then cp -r ${APP_DIR} ${BACKUP_DIR} && echo 'Backup created: ${BACKUP_DIR}'; else echo 'No existing deployment to backup'; fi" || true
echo -e "${GREEN}✅ Backup completed${NC}"
echo ""

# Step 8: Stop application
echo -e "${YELLOW}🛑 Step 8: Stopping application...${NC}"
$SSH_CMD "cd ${APP_DIR}/backend 2>/dev/null && pm2 stop silent-equity-backend 2>/dev/null || pm2 stop all 2>/dev/null || echo 'No PM2 process found'" || true
echo -e "${GREEN}✅ Application stopped${NC}"
echo ""

# Step 9: Upload archive
echo -e "${YELLOW}📤 Step 9: Uploading deployment archive...${NC}"
echo "  Uploading ${ARCHIVE_NAME} to ${VPS_SSH}:${APP_DIR}/"
if [ "$USE_SSHPASS" = true ]; then
    $SCP_CMD "$ARCHIVE_NAME" "${VPS_SSH}:${APP_DIR}/" || {
        echo -e "${RED}❌ Upload failed!${NC}"
        exit 1
    }
else
    echo -e "${YELLOW}   Please enter password when prompted: ${VPS_PASSWORD}${NC}"
    $SCP_CMD "$ARCHIVE_NAME" "${VPS_SSH}:${APP_DIR}/" || {
        echo -e "${RED}❌ Upload failed!${NC}"
        exit 1
    }
fi
echo -e "${GREEN}✅ Archive uploaded${NC}"
echo ""

# Step 10: Extract and deploy
echo -e "${YELLOW}📦 Step 10: Extracting and deploying...${NC}"
$SSH_CMD "cd ${APP_DIR} && \
    rm -rf backend/* frontend/dist/* 2>/dev/null || true && \
    tar -xzf ${ARCHIVE_NAME} && \
    rm -f ${ARCHIVE_NAME} && \
    echo 'Files extracted successfully'" || {
    echo -e "${RED}❌ Extraction failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Files extracted${NC}"
echo ""

# Step 11: Install dependencies
echo -e "${YELLOW}📥 Step 11: Installing dependencies...${NC}"
$SSH_CMD "cd ${APP_DIR}/backend && npm install --production" || {
    echo -e "${RED}❌ Dependency installation failed!${NC}"
    exit 1
}
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 12: Start application
echo -e "${YELLOW}🚀 Step 12: Starting application...${NC}"
$SSH_CMD "cd ${APP_DIR}/backend && \
    pm2 start server.js --name 'silent-equity-backend' --update-env && \
    pm2 save" || {
    echo -e "${YELLOW}⚠️  PM2 start failed, trying alternative method...${NC}"
    $SSH_CMD "cd ${APP_DIR}/backend && pm2 restart silent-equity-backend || pm2 start server.js --name 'silent-equity-backend'" || true
}
echo -e "${GREEN}✅ Application started${NC}"
echo ""

# Step 13: Verify deployment
echo -e "${YELLOW}✅ Step 13: Verifying deployment...${NC}"
sleep 2
$SSH_CMD "pm2 status" || true
echo ""
$SSH_CMD "curl -s http://localhost:5001/api/health || echo 'Health check failed'" || true
echo ""

# Final summary
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo "  VPS: ${VPS_SSH}"
echo "  Directory: ${APP_DIR}"
echo "  Backup: ${BACKUP_DIR}"
echo "  Archive: ${ARCHIVE_NAME}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Check application logs: ssh ${VPS_SSH} 'pm2 logs silent-equity-backend'"
echo "  2. Verify health: ssh ${VPS_SSH} 'curl http://localhost:5001/api/health'"
echo "  3. Check PM2 status: ssh ${VPS_SSH} 'pm2 status'"
echo ""
echo -e "${YELLOW}Rollback (if needed):${NC}"
echo "  ssh ${VPS_SSH}"
echo "  cd ${APP_DIR}"
echo "  pm2 stop silent-equity-backend"
echo "  rm -rf backend frontend"
echo "  cp -r ${BACKUP_DIR}/* ."
echo "  cd backend && pm2 start server.js --name 'silent-equity-backend'"
echo ""




