#!/bin/bash

# 🚀 Interactive SSH VPS Deployment Script
# Step-by-step deployment with manual confirmation at each step

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

echo -e "${BLUE}🚀 Silent Equity - Interactive SSH Deployment${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}VPS: ${VPS_SSH}${NC}"
echo ""

# Function to prompt for confirmation
confirm_step() {
    local step_name="$1"
    local step_description="$2"
    
    echo ""
    echo -e "${BLUE}${step_name}${NC}"
    echo -e "${YELLOW}${step_description}${NC}"
    read -p "Continue? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Step cancelled${NC}"
        return 1
    fi
    return 0
}

# Step 1: Prepare deployment package
echo -e "${YELLOW}📋 Step 1: Preparing deployment package...${NC}"

if [ ! -d "$BACKEND_DIR" ] || [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Backend or frontend directory not found!${NC}"
    exit 1
fi

# Build frontend
echo "  Building frontend..."
cd "$FRONTEND_DIR"
npm run build
cd ..

# Create deployment directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy files
echo "  Copying backend files..."
rsync -av --exclude='node_modules' --exclude='.env' --exclude='*.log' --exclude='.git' \
    "$BACKEND_DIR/" "$DEPLOY_DIR/backend/"

echo "  Copying frontend build..."
cp -r "$FRONTEND_DIR/dist" "$DEPLOY_DIR/frontend/"
cp "$BACKEND_DIR/package.json" "$DEPLOY_DIR/backend/"
cp "$FRONTEND_DIR/package.json" "$DEPLOY_DIR/frontend/"

# Create archive
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"
cd "$DEPLOY_DIR"
tar -czf "../$ARCHIVE_NAME" .
cd ..

echo -e "${GREEN}✅ Deployment package ready: ${ARCHIVE_NAME}${NC}"
echo ""

# Step 2: Connect to VPS
if ! confirm_step "🔌 Step 2: Connect to VPS" "Connecting to ${VPS_SSH}..."; then
    exit 1
fi

echo "  Testing SSH connection..."
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 "${VPS_SSH}" "echo 'Connection successful'" || {
    echo -e "${RED}❌ Failed to connect to VPS!${NC}"
    echo -e "${YELLOW}   Please verify:${NC}"
    echo "     - VPS is accessible"
    echo "     - SSH credentials are correct"
    echo "     - Firewall allows SSH connections"
    exit 1
}

echo -e "${GREEN}✅ Connected to VPS${NC}"

# Step 3: Detect application directory
echo ""
echo -e "${YELLOW}🔍 Step 3: Detecting application directory...${NC}"

APP_DIRS=(
    "/var/www/${PROJECT_NAME}"
    "/home/${VPS_USER}/${PROJECT_NAME}"
    "/home/${VPS_USER}/www/${PROJECT_NAME}"
    "/opt/${PROJECT_NAME}"
)

APP_DIR=""
for dir in "${APP_DIRS[@]}"; do
    if ssh "${VPS_SSH}" "test -d $dir" 2>/dev/null; then
        APP_DIR="$dir"
        echo -e "${GREEN}✅ Found: ${APP_DIR}${NC}"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    APP_DIR="/home/${VPS_USER}/${PROJECT_NAME}"
    echo -e "${YELLOW}⚠️  No existing deployment found${NC}"
    echo -e "${YELLOW}   Will use: ${APP_DIR}${NC}"
    
    if confirm_step "📁 Create directory" "Create ${APP_DIR} on VPS?"; then
        ssh "${VPS_SSH}" "mkdir -p ${APP_DIR}"
        echo -e "${GREEN}✅ Directory created${NC}"
    else
        echo -e "${RED}❌ Cannot proceed without directory${NC}"
        exit 1
    fi
fi

# Step 4: Backup old version
if confirm_step "💾 Step 4: Backup old version" "Create backup of existing deployment?"; then
    BACKUP_DIR="${APP_DIR}.backup.${TIMESTAMP}"
    ssh "${VPS_SSH}" "if [ -d ${APP_DIR} ] && [ \"\$(ls -A ${APP_DIR} 2>/dev/null)\" ]; then \
        cp -r ${APP_DIR} ${BACKUP_DIR} && \
        echo 'Backup created: ${BACKUP_DIR}'; \
    else \
        echo 'No existing files to backup'; \
    fi"
    echo -e "${GREEN}✅ Backup completed${NC}"
fi

# Step 5: Stop application
if confirm_step "🛑 Step 5: Stop application" "Stop PM2 processes?"; then
    ssh "${VPS_SSH}" "cd ${APP_DIR}/backend 2>/dev/null && \
        (pm2 stop silent-equity-backend 2>/dev/null || \
         pm2 stop all 2>/dev/null || \
         echo 'No PM2 process found') || \
        echo 'Backend directory not found or PM2 not running'"
    echo -e "${GREEN}✅ Application stopped${NC}"
fi

# Step 6: Upload archive
if confirm_step "📤 Step 6: Upload archive" "Upload ${ARCHIVE_NAME} to VPS?"; then
    echo "  Uploading..."
    scp -o StrictHostKeyChecking=no "${ARCHIVE_NAME}" "${VPS_SSH}:${APP_DIR}/" || {
        echo -e "${RED}❌ Upload failed!${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Archive uploaded${NC}"
fi

# Step 7: Extract files
if confirm_step "📦 Step 7: Extract files" "Extract archive and remove old files?"; then
    ssh "${VPS_SSH}" "cd ${APP_DIR} && \
        rm -rf backend/* frontend/dist/* 2>/dev/null || true && \
        tar -xzf ${ARCHIVE_NAME} && \
        rm -f ${ARCHIVE_NAME} && \
        echo 'Files extracted successfully'"
    echo -e "${GREEN}✅ Files extracted${NC}"
fi

# Step 8: Install dependencies
if confirm_step "📥 Step 8: Install dependencies" "Run npm install --production?"; then
    ssh "${VPS_SSH}" "cd ${APP_DIR}/backend && npm install --production"
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Step 9: Start application
if confirm_step "🚀 Step 9: Start application" "Start application with PM2?"; then
    ssh "${VPS_SSH}" "cd ${APP_DIR}/backend && \
        pm2 start server.js --name 'silent-equity-backend' --update-env && \
        pm2 save || \
        (pm2 restart silent-equity-backend || pm2 start server.js --name 'silent-equity-backend')"
    echo -e "${GREEN}✅ Application started${NC}"
fi

# Step 10: Verify deployment
echo ""
echo -e "${YELLOW}✅ Step 10: Verifying deployment...${NC}"
sleep 2

echo "  PM2 Status:"
ssh "${VPS_SSH}" "pm2 status" || true

echo ""
echo "  Health Check:"
ssh "${VPS_SSH}" "curl -s http://localhost:5001/api/health || echo 'Health check failed'" || true

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  VPS: ${VPS_SSH}"
echo "  Directory: ${APP_DIR}"
echo "  Archive: ${ARCHIVE_NAME}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs: ssh ${VPS_SSH} 'pm2 logs silent-equity-backend'"
echo "  Check status: ssh ${VPS_SSH} 'pm2 status'"
echo "  Health check: ssh ${VPS_SSH} 'curl http://localhost:5001/api/health'"
echo ""




