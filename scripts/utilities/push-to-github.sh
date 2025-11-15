#!/bin/bash
# One-command push script
# Usage: ./push-to-github.sh YOUR_REPO_URL

if [ -z "$1" ]; then
    echo "Usage: ./push-to-github.sh https://github.com/USERNAME/REPO.git"
    exit 1
fi

git remote remove origin 2>/dev/null
git remote add origin "$1"
git branch -M main 2>/dev/null
echo "📤 Pushing to GitHub..."
git push -u origin main
