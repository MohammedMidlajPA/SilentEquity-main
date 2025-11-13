#!/bin/bash

# Fully Automatic GitHub Setup and Push
# This script installs GitHub CLI (if needed) and pushes your code

echo "🚀 Fully Automatic GitHub Push"
echo "==============================="
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "📦 Installing GitHub CLI..."
    if command -v brew &> /dev/null; then
        brew install gh
    else
        echo "❌ Homebrew not found. Please install GitHub CLI manually:"
        echo "   https://cli.github.com/"
        exit 1
    fi
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 GitHub CLI not authenticated"
    echo ""
    echo "Please authenticate:"
    echo "   gh auth login"
    echo ""
    echo "Then run this script again, or use:"
    echo "   ./quick-push.sh YOUR_REPO_URL"
    exit 1
fi

# Get repo name from current directory
REPO_NAME=$(basename "$(pwd)")

echo "✅ GitHub CLI ready"
echo "📦 Repository name: $REPO_NAME"
echo ""

# Check if repo already exists
if gh repo view "$REPO_NAME" &> /dev/null; then
    echo "✅ Repository already exists on GitHub"
    REMOTE_URL=$(gh repo view "$REPO_NAME" --json url -q .url)
    git remote remove origin 2>/dev/null
    git remote add origin "$REMOTE_URL"
    git branch -M main 2>/dev/null
    echo "📤 Pushing to existing repository..."
    git push -u origin main
else
    echo "📦 Creating new repository: $REPO_NAME"
    echo ""
    read -p "❓ Make repository private? (y/n, default: y): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        PRIVATE_FLAG="--public"
    else
        PRIVATE_FLAG="--private"
    fi
    
    if gh repo create "$REPO_NAME" $PRIVATE_FLAG --source=. --remote=origin --push; then
        echo ""
        echo "✅ Repository created and pushed to GitHub!"
        REPO_URL=$(gh repo view "$REPO_NAME" --json url -q .url)
        echo "🔗 View at: $REPO_URL"
    else
        echo "❌ Failed to create repository"
        exit 1
    fi
fi

