#!/bin/bash

# Script to update Nginx configuration to prevent HTML caching
# This ensures users always get the latest version without manual cache clearing

set -e

VPS_HOST="72.60.108.234"
VPS_USER="deployer"
VPS_PASSWORD="silentequitydeployer@0007"
NGINX_CONFIG="/etc/nginx/sites-available/silentequity"
NGINX_BACKUP="/etc/nginx/sites-available/silentequity.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔧 Updating Nginx configuration to prevent HTML caching..."

# Create the updated config file locally
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/nginx-no-cache.conf"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Error: Config file not found at $CONFIG_FILE"
    exit 1
fi

# Upload config to VPS
echo "📤 Uploading new Nginx configuration..."
expect << EOF
set timeout 30
spawn scp -o StrictHostKeyChecking=no "$CONFIG_FILE" ${VPS_USER}@${VPS_HOST}:/tmp/nginx-no-cache.conf
expect "password:"
send "${VPS_PASSWORD}\r"
expect eof
EOF

# Backup existing config and apply new one
echo "💾 Backing up existing config and applying new configuration..."
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_HOST}
expect "password:"
send "${VPS_PASSWORD}\r"
expect "\$ "
send "sudo cp ${NGINX_CONFIG} ${NGINX_BACKUP}\r"
expect {
    "password" {
        send "${VPS_PASSWORD}\r"
        exp_continue
    }
    "\$ " {
        exp_continue
    }
}
send "sudo cp /tmp/nginx-no-cache.conf ${NGINX_CONFIG}\r"
expect {
    "password" {
        send "${VPS_PASSWORD}\r"
        exp_continue
    }
    "\$ " {
        exp_continue
    }
}
send "sudo nginx -t\r"
expect {
    "password" {
        send "${VPS_PASSWORD}\r"
        exp_continue
    }
    "\$ " {
        exp_continue
    }
}
send "sudo systemctl reload nginx\r"
expect {
    "password" {
        send "${VPS_PASSWORD}\r"
        exp_continue
    }
    "\$ " {
        exp_continue
    }
}
send "exit\r"
expect eof
EOF

echo "✅ Nginx configuration updated successfully!"
echo ""
echo "📋 Changes applied:"
echo "   - HTML files (index.html) now have 'no-cache' headers"
echo "   - Static assets (JS/CSS with hashes) still cached for 1 year"
echo "   - API responses have no-cache headers"
echo ""
echo "🔄 Users will now automatically get the latest version without clearing cache!"
echo ""
echo "📝 Backup saved at: ${NGINX_BACKUP}"

