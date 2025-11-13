#!/bin/bash

# Quick GitHub Push - Just provide your repo URL
# Usage: ./quick-push.sh YOUR_REPO_URL

if [ -z "$1" ]; then
    echo "❌ Please provide your GitHub repository URL"
    echo ""
    echo "Usage: ./quick-push.sh https://github.com/USERNAME/REPO.git"
    echo ""
    echo "Or create a repo first at: https://github.com/new"
    exit 1
fi

REPO_URL="$1"

echo "🚀 Setting up GitHub push..."
echo ""

# Remove existing origin if any
git remote remove origin 2>/dev/null

# Add new origin
git remote add origin "$REPO_URL"

# Ensure we're on main branch
git branch -M main 2>/dev/null || git checkout -b main 2>/dev/null

# Push
echo "📤 Pushing to GitHub..."
if git push -u origin main; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 Repository: $REPO_URL"
else
    echo ""
    echo "❌ Push failed. Possible reasons:"
    echo "   1. Repository doesn't exist - create it at https://github.com/new"
    echo "   2. Authentication required - set up SSH key or use HTTPS with token"
    echo "   3. Repository already has content - try: git push -u origin main --force"
    exit 1
fi

