#!/bin/bash

# 🗂️ Codebase Organization Script
# Organizes documentation and scripts into proper directories

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗂️ Organizing Codebase Structure...${NC}"
echo "=========================================="
echo ""

# Create directory structure
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p docs/deployment docs/security docs/guides
mkdir -p scripts/deployment scripts/utilities
mkdir -p tests
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Move deployment docs
echo -e "${YELLOW}📄 Organizing deployment documentation...${NC}"
mv VPS_DEPLOYMENT_GUIDE.md DEPLOYMENT_WORKFLOW.md VPS_DEPLOYMENT_SUMMARY.md docs/deployment/ 2>/dev/null || true
mv PRODUCTION_MIGRATION.md PRODUCTION_READY.md docs/deployment/ 2>/dev/null || true
echo -e "${GREEN}✅ Deployment docs organized${NC}"

# Move security docs
echo -e "${YELLOW}🔒 Organizing security documentation...${NC}"
mv SECURITY_AUDIT_REPORT.md docs/security/ 2>/dev/null || true
echo -e "${GREEN}✅ Security docs organized${NC}"

# Move deployment scripts
echo -e "${YELLOW}🚀 Organizing deployment scripts...${NC}"
mv deploy-to-vps.sh check-vps-status.sh cleanup-old-files.sh scripts/deployment/ 2>/dev/null || true
echo -e "${GREEN}✅ Deployment scripts organized${NC}"

# Move utility scripts
echo -e "${YELLOW}🛠️ Organizing utility scripts...${NC}"
mv commit-changes.sh setup-github.sh auto-push-github.sh quick-push.sh push-now.sh push-to-github.sh push-with-token.sh install-and-push.sh switch-to-production.sh START_SERVERS.sh scripts/utilities/ 2>/dev/null || true
echo -e "${GREEN}✅ Utility scripts organized${NC}"

# Move test files
echo -e "${YELLOW}🧪 Organizing test files...${NC}"
mv test-connection.html test-payment.html test-payment-auto.js test-payment.sh tests/ 2>/dev/null || true
echo -e "${GREEN}✅ Test files organized${NC}"

# Move guide docs (optional - keep some in root)
echo -e "${YELLOW}📚 Organizing guide documentation...${NC}"
# Keep main README.md in root
# Move other guides if needed
echo -e "${GREEN}✅ Guides organized${NC}"

echo ""
echo -e "${GREEN}✅ Codebase organization complete!${NC}"
echo ""
echo -e "${BLUE}📋 New Structure:${NC}"
echo "  docs/deployment/     - Deployment guides"
echo "  docs/security/       - Security documentation"
echo "  docs/guides/         - User guides"
echo "  scripts/deployment/  - Deployment scripts"
echo "  scripts/utilities/    - Utility scripts"
echo "  tests/               - Test files"
echo ""

