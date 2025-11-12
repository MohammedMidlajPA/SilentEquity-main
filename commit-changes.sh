#!/bin/bash

# Interactive Git Commit Script
# This script asks before committing changes

echo "🔍 Checking for changes..."
echo ""

# Check if there are any changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show what will be committed
echo "📋 Changes to be committed:"
echo ""
git status --short
echo ""

# Ask for confirmation
read -p "❓ Do you want to commit these changes? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Commit cancelled"
    exit 1
fi

# Ask for commit message
echo ""
read -p "📝 Enter commit message (or press Enter for default): " commit_message

if [ -z "$commit_message" ]; then
    commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Add all changes
echo ""
echo "➕ Adding changes..."
git add .

# Commit
echo "💾 Committing changes..."
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Changes committed successfully!"
    echo ""
    echo "📤 To push to GitHub, run:"
    echo "   git push origin main"
else
    echo ""
    echo "❌ Commit failed"
    exit 1
fi

