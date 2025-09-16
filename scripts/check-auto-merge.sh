#!/bin/bash

# Auto-merge Status Check Script
# Usage: ./check-auto-merge.sh

echo "🔍 Auto-merge System Status Check"
echo "================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get current branch info
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Check if workflows exist
echo ""
echo "📋 Checking workflow files..."
if [ -f ".github/workflows/auto-merge-main-to-release.yml" ]; then
    echo "✅ Auto-merge workflow found"
else
    echo "❌ Auto-merge workflow missing"
fi

if [ -f ".github/workflows/manual-sync-main-to-release.yml" ]; then
    echo "✅ Manual sync workflow found"
else
    echo "❌ Manual sync workflow missing"
fi

# Check branch sync status
echo ""
echo "🔄 Branch Sync Status..."

# Fetch latest from remote
git fetch origin --quiet

# Get commit counts
MAIN_COMMIT=$(git rev-parse origin/main)
RELEASE_COMMIT=$(git rev-parse origin/release)

echo "🌟 Main branch:    $MAIN_COMMIT"
echo "🚀 Release branch: $RELEASE_COMMIT"

if [ "$MAIN_COMMIT" = "$RELEASE_COMMIT" ]; then
    echo "✅ Branches are in sync!"
    echo "🎉 Auto-merge system is working correctly"
else
    BEHIND_COUNT=$(git rev-list --count origin/release..origin/main)
    AHEAD_COUNT=$(git rev-list --count origin/main..origin/release)
    
    echo "⚠️ Branches are out of sync:"
    echo "   📉 Release is $BEHIND_COUNT commits behind main"
    echo "   📈 Release is $AHEAD_COUNT commits ahead of main"
    
    if [ "$BEHIND_COUNT" -gt 0 ]; then
        echo ""
        echo "🤖 Expected behavior:"
        echo "   • Auto-merge should trigger for commits to main"
        echo "   • Check GitHub Actions tab for workflow status"
        echo "   • If conflicts exist, PR should be created"
    fi
fi

# Check for test file
echo ""
echo "🧪 Test Status..."
if [ -f "TEST-AUTO-MERGE.md" ]; then
    echo "✅ Test file exists on current branch"
    if git ls-tree origin/release --name-only | grep -q "TEST-AUTO-MERGE.md"; then
        echo "✅ Test file exists on release branch - Auto-merge worked!"
    else
        echo "⏳ Test file not yet on release branch - Check workflow progress"
    fi
else
    echo "ℹ️ No test file found"
fi

echo ""
echo "📊 Quick Commands:"
echo "• Check workflows: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[/:]\([^/]*\/[^/]*\).*/\1/' | sed 's/\.git$//')/actions"
echo "• Manual sync: Go to Actions → 'Manual sync main to release' → Run workflow"
echo "• View documentation: cat .github/AUTO-MERGE.md"

echo ""
echo "✨ Auto-merge system check complete!"