#!/bin/bash

# GitHub Setup Script
# This script helps you push to GitHub

echo "🚀 GitHub Setup for Silent Equity"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ GitHub remote already configured:"
    git remote -v
    echo ""
    read -p "❓ Do you want to update it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "📝 Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " repo_url
        git remote set-url origin "$repo_url"
        echo "✅ Remote updated!"
    fi
else
    echo "📝 No GitHub remote configured yet."
    echo ""
    echo "Steps to set up GitHub:"
    echo "1. Go to https://github.com and create a new repository"
    echo "2. Copy the repository URL"
    echo "3. Run this command:"
    echo "   git remote add origin YOUR_REPO_URL"
    echo ""
    read -p "❓ Do you have a repository URL ready? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "📝 Enter your GitHub repository URL: " repo_url
        git remote add origin "$repo_url"
        echo "✅ Remote added!"
    else
        echo "ℹ️  You can add it later with:"
        echo "   git remote add origin YOUR_REPO_URL"
        exit 0
    fi
fi

# Check current branch
current_branch=$(git branch --show-current)
echo ""
echo "📌 Current branch: $current_branch"

# Ask to push
echo ""
read -p "❓ Do you want to push to GitHub now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to GitHub..."
    git push -u origin "$current_branch"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
    else
        echo ""
        echo "❌ Push failed. You may need to:"
        echo "   1. Create the repository on GitHub first"
        echo "   2. Set up authentication (SSH key or personal access token)"
    fi
fi

