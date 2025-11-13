#!/bin/bash

# Push to GitHub Now - Tries multiple methods

REPO_NAME=$(basename "$(pwd)")

echo "🚀 Pushing to GitHub..."
echo ""

# Method 1: Try GitHub CLI if authenticated
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    echo "✅ Using GitHub CLI..."
    if gh repo create "$REPO_NAME" --private --source=. --remote=origin --push 2>/dev/null; then
        echo "✅ Successfully pushed!"
        exit 0
    fi
fi

# Method 2: Check if remote exists and push
if git remote get-url origin &> /dev/null; then
    echo "✅ Remote exists, pushing..."
    git branch -M main 2>/dev/null
    if git push -u origin main 2>&1; then
        echo "✅ Successfully pushed!"
        exit 0
    fi
fi

# Method 3: Try to create repo via API (if token exists)
if [ ! -z "$GITHUB_TOKEN" ]; then
    echo "✅ Using GitHub token..."
    USERNAME=$(gh api user --jq .login 2>/dev/null || echo "")
    if [ ! -z "$USERNAME" ]; then
        curl -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/user/repos \
            -d "{\"name\":\"$REPO_NAME\",\"private\":true}" \
            &> /dev/null
        
        git remote add origin "https://$USERNAME:$GITHUB_TOKEN@github.com/$USERNAME/$REPO_NAME.git" 2>/dev/null
        git branch -M main 2>/dev/null
        git push -u origin main 2>&1
        exit 0
    fi
fi

# If all methods fail, provide instructions
echo "❌ Automatic push failed. Quick setup:"
echo ""
echo "1. Create repo: https://github.com/new (name: $REPO_NAME)"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
echo "3. Run: git branch -M main && git push -u origin main"
echo ""
echo "Or authenticate GitHub CLI:"
echo "   gh auth login"
echo "   ./install-and-push.sh"

