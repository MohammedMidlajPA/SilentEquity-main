#!/bin/bash

# Automatic GitHub Push Script
# This script automatically sets up and pushes to GitHub

echo "🚀 Automatic GitHub Push Setup"
echo "=============================="
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found!"
    
    # Check if logged in
    if gh auth status &> /dev/null; then
        echo "✅ GitHub CLI authenticated"
        
        # Get current directory name for repo name
        REPO_NAME=$(basename "$(pwd)")
        
        echo ""
        echo "📦 Creating GitHub repository: $REPO_NAME"
        echo ""
        
        # Create private repo by default (change to --public if needed)
        if gh repo create "$REPO_NAME" --private --source=. --remote=origin --push 2>/dev/null; then
            echo ""
            echo "✅ Repository created and pushed to GitHub!"
            echo "🔗 View at: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
            exit 0
        else
            echo "⚠️  Repository might already exist or there was an error"
        fi
    else
        echo "❌ GitHub CLI not authenticated"
        echo "   Run: gh auth login"
    fi
fi

# Fallback: Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo "✅ GitHub remote already configured"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote: $REMOTE_URL"
    echo ""
    read -p "❓ Push to existing remote? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CURRENT_BRANCH=$(git branch --show-current)
        echo "📤 Pushing to GitHub..."
        git push -u origin "$CURRENT_BRANCH"
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to GitHub!"
            exit 0
        fi
    fi
fi

# If we get here, need manual setup
echo ""
echo "📝 Manual setup required:"
echo ""
echo "1. Create a repository on GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Then run:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Or install GitHub CLI and authenticate:"
echo "   brew install gh"
echo "   gh auth login"

