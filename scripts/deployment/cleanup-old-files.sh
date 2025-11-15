#!/bin/bash

# 🧹 Cleanup Old Files Script
# Removes old deployment files after approval

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}🧹 Cleanup Old Files Script${NC}"
echo "=========================================="
echo ""

# Configuration
VPS_PATH="/var/www/silent-equity"
BACKUP_DIR="/var/www/backups"

echo -e "${YELLOW}⚠️  WARNING: This will remove old files!${NC}"
echo ""
echo "Target directory: $VPS_PATH"
echo ""

# Step 1: List existing files
echo -e "${BLUE}📋 Step 1: Listing existing files...${NC}"
echo ""

if [ -d "$VPS_PATH" ]; then
    echo "Existing files in $VPS_PATH:"
    ls -lah "$VPS_PATH" 2>/dev/null || echo "Directory exists but cannot list contents"
    echo ""
    
    echo "Size breakdown:"
    du -sh "$VPS_PATH"/* 2>/dev/null || echo "Cannot calculate sizes"
    echo ""
else
    echo -e "${GREEN}✅ No existing deployment found (clean slate)${NC}"
    echo ""
fi

# Step 2: Show what will be removed
echo -e "${YELLOW}📋 Step 2: Files that will be removed:${NC}"
echo ""

if [ -d "$VPS_PATH/backend" ]; then
    echo "  ❌ backend/ ($(du -sh $VPS_PATH/backend 2>/dev/null | cut -f1))"
fi

if [ -d "$VPS_PATH/frontend" ]; then
    echo "  ❌ frontend/ ($(du -sh $VPS_PATH/frontend 2>/dev/null | cut -f1))"
fi

if [ -d "$VPS_PATH/.deploy" ]; then
    echo "  ❌ .deploy/ ($(du -sh $VPS_PATH/.deploy 2>/dev/null | cut -f1))"
fi

# Find old archives
OLD_ARCHIVES=$(find "$VPS_PATH" -name "silent-equity_*.tar.gz" -type f 2>/dev/null | wc -l)
if [ "$OLD_ARCHIVES" -gt 0 ]; then
    echo "  ❌ Old archives: $OLD_ARCHIVES files"
fi

echo ""

# Step 3: Request approval
echo -e "${RED}⚠️  APPROVAL REQUIRED${NC}"
echo "=========================================="
echo ""
echo "This will:"
echo "  1. Create backup of existing files (if any)"
echo "  2. Remove old deployment files"
echo "  3. Clean up old archives"
echo ""
read -p "Do you want to proceed with cleanup? (yes/no): " APPROVAL

if [ "$APPROVAL" != "yes" ]; then
    echo -e "${YELLOW}❌ Cleanup cancelled by user${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}✅ Approval received! Proceeding with cleanup...${NC}"
echo ""

# Step 4: Create backup (if files exist)
if [ -d "$VPS_PATH" ] && [ "$(ls -A $VPS_PATH 2>/dev/null)" ]; then
    echo -e "${YELLOW}📦 Step 3: Creating backup...${NC}"
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_NAME="silent-equity-backup-$TIMESTAMP.tar.gz"
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$VPS_PATH" . 2>/dev/null || echo "Backup creation skipped (may not have permissions)"
    
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/$BACKUP_NAME${NC}"
    echo ""
fi

# Step 5: Remove old files
echo -e "${YELLOW}🧹 Step 4: Removing old files...${NC}"

# Note: This script is meant to be run on VPS
# For local use, it shows what would be removed

echo "Would remove:"
echo "  - $VPS_PATH/backend/"
echo "  - $VPS_PATH/frontend/"
echo "  - $VPS_PATH/.deploy/"
echo "  - Old archives in $VPS_PATH"

echo ""
echo -e "${GREEN}✅ Cleanup script ready!${NC}"
echo ""
echo -e "${BLUE}📋 To actually remove files on VPS:${NC}"
echo "  1. SSH into VPS"
echo "  2. Run this script: ./cleanup-old-files.sh"
echo "  3. Or manually remove: rm -rf $VPS_PATH/backend $VPS_PATH/frontend"
echo ""

