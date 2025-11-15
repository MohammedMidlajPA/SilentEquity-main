#!/bin/bash

# 🚀 VPS Deployment Script with Approval Workflow
# This script prepares deployment and requires approval before publishing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Silent Equity - VPS Deployment Script${NC}"
echo "=========================================="
echo ""

# Configuration
PROJECT_NAME="silent-equity"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
DEPLOY_DIR=".deploy"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

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

# Copy backend files (excluding node_modules)
echo "  📁 Copying backend files..."
rsync -av --exclude='node_modules' --exclude='.env' --exclude='*.log' \
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
EOF

echo -e "${GREEN}✅ Deployment package prepared${NC}"
echo ""

# Step 4: Show deployment summary
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo "=========================================="
echo "Project Name: $PROJECT_NAME"
echo "Timestamp: $TIMESTAMP"
echo "Backend Size: $(du -sh $DEPLOY_DIR/backend | cut -f1)"
echo "Frontend Size: $(du -sh $DEPLOY_DIR/frontend | cut -f1)"
echo "Total Size: $(du -sh $DEPLOY_DIR | cut -f1)"
echo ""
echo -e "${YELLOW}📁 Files to be deployed:${NC}"
find "$DEPLOY_DIR" -type f | head -20
if [ $(find "$DEPLOY_DIR" -type f | wc -l) -gt 20 ]; then
    echo "... and $(($(find "$DEPLOY_DIR" -type f | wc -l) - 20)) more files"
fi
echo ""

# Step 5: Show what will be removed (if exists)
echo -e "${YELLOW}⚠️  Old files will be removed before deployment${NC}"
echo ""

# Step 6: Request approval
echo -e "${RED}⚠️  APPROVAL REQUIRED${NC}"
echo "=========================================="
echo ""
echo "This will:"
echo "  1. Remove existing files on VPS (if any)"
echo "  2. Deploy new application files"
echo "  3. Install dependencies"
echo "  4. Start the application"
echo ""
read -p "Do you want to proceed with deployment? (yes/no): " APPROVAL

if [ "$APPROVAL" != "yes" ]; then
    echo -e "${YELLOW}❌ Deployment cancelled by user${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Approval received! Proceeding with deployment...${NC}"
echo ""

# Step 7: Create deployment archive
echo -e "${YELLOW}📦 Step 4: Creating deployment archive...${NC}"
ARCHIVE_NAME="${PROJECT_NAME}_${TIMESTAMP}.tar.gz"
cd "$DEPLOY_DIR"
tar -czf "../$ARCHIVE_NAME" .
cd ..
echo -e "${GREEN}✅ Archive created: $ARCHIVE_NAME${NC}"
echo ""

# Step 8: Save deployment info
echo -e "${GREEN}✅ Deployment package ready!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "  1. Review the deployment package in: $DEPLOY_DIR"
echo "  2. Archive created: $ARCHIVE_NAME"
echo "  3. Use Hostinger MCP to deploy to VPS"
echo "  4. Or manually upload and extract on VPS"
echo ""
echo -e "${YELLOW}💡 To deploy via Hostinger MCP, use:${NC}"
echo "   - Upload archive to VPS"
echo "   - Extract and install dependencies"
echo "   - Configure environment variables"
echo "   - Start the application"
echo ""

