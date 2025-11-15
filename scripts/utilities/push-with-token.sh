#!/bin/bash

# Push using GitHub token directly
# Usage: GITHUB_TOKEN=your_token ./push-with-token.sh

REPO_NAME=$(basename "$(pwd)")

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    echo ""
    echo "Usage: GITHUB_TOKEN=your_token ./push-with-token.sh"
    echo ""
    echo "Or set it first:"
    echo "   export GITHUB_TOKEN=your_token"
    echo "   ./push-with-token.sh"
    exit 1
fi

echo "🚀 Pushing to GitHub with token..."
echo ""

# Get username from token
USERNAME=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | grep -o '"login":"[^"]*' | cut -d'"' -f4)

if [ -z "$USERNAME" ]; then
    echo "❌ Invalid token or couldn't get username"
    exit 1
fi

echo "✅ Authenticated as: $USERNAME"
echo "📦 Repository: $REPO_NAME"
echo ""

# Create repository via API
echo "📦 Creating repository..."
CREATE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"auto_init\":false}")

# Check if repo was created or already exists
if echo "$CREATE_RESPONSE" | grep -q '"name"'; then
    echo "✅ Repository created"
elif echo "$CREATE_RESPONSE" | grep -q "already exists"; then
    echo "✅ Repository already exists"
else
    echo "⚠️  Note: $CREATE_RESPONSE"
fi

# Set up remote and push
echo ""
echo "📤 Setting up remote and pushing..."
git remote remove origin 2>/dev/null
git remote add origin "https://${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
git branch -M main 2>/dev/null

if git push -u origin main 2>&1; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🔗 https://github.com/${USERNAME}/${REPO_NAME}"
else
    echo ""
    echo "❌ Push failed. Trying with different method..."
    # Try with token in URL
    git remote set-url origin "https://${USERNAME}:${GITHUB_TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git"
    git push -u origin main
fi

