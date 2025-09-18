#!/bin/bash

# Manual sync script to merge main into release
# This script handles conflicts by creating a PR when needed

set -e  # Exit on any error

echo "🔄 Manual Sync: main → release"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${BLUE}Current branch: ${CURRENT_BRANCH}${NC}"

# Ensure we're in a clean state
if [[ $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Working directory is not clean. Please commit or stash changes.${NC}"
    exit 1
fi

# Fetch latest changes
echo -e "${BLUE}🔄 Fetching latest changes...${NC}"
git fetch origin

# Check if release branch exists
if ! git rev-parse --verify origin/release >/dev/null 2>&1; then
    echo -e "${YELLOW}🌱 Release branch doesn't exist. Creating from main...${NC}"
    git checkout -b release origin/main
    git push origin release
    echo -e "${GREEN}✅ Release branch created successfully${NC}"
    exit 0
fi

# Switch to release branch
echo -e "${BLUE}🔄 Switching to release branch...${NC}"
git checkout release
git pull origin release

# Check if already up to date
if git merge-base --is-ancestor origin/main release; then
    echo -e "${GREEN}📋 Release branch is already up to date with main${NC}"
    git checkout "$CURRENT_BRANCH"
    exit 0
fi

# Show what will be merged
echo -e "${BLUE}📊 Changes to be merged:${NC}"
git log --oneline release..origin/main --max-count=10

echo ""
echo -e "${YELLOW}🤔 Choose merge strategy:${NC}"
echo "1) Auto-merge (if no conflicts)"
echo "2) Force merge (overwrite conflicts with main)"  
echo "3) Create merge branch for manual resolution"
echo "4) Cancel"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo -e "${BLUE}🔄 Attempting auto-merge...${NC}"
        
        if git merge origin/main --no-edit; then
            echo -e "${GREEN}✅ Auto-merge successful!${NC}"
            
            # Push changes
            git push origin release
            echo -e "${GREEN}🚀 Changes pushed to release branch${NC}"
            
            # Show summary
            echo -e "${GREEN}📊 Merge Summary:${NC}"
            git log --oneline -1
            
        else
            echo -e "${RED}❌ Auto-merge failed due to conflicts${NC}"
            echo -e "${YELLOW}📋 Conflicting files:${NC}"
            git diff --name-only --diff-filter=U
            
            # Abort the merge
            git merge --abort
            
            echo ""
            echo -e "${YELLOW}💡 Options:${NC}"
            echo "1. Run this script again and choose option 2 (force merge)"
            echo "2. Run this script again and choose option 3 (manual resolution)"
            echo "3. Manually resolve conflicts:"
            echo "   git merge origin/main"
            echo "   # Edit conflicting files"
            echo "   git add ."
            echo "   git commit"
            echo "   git push origin release"
        fi
        ;;
        
    2)
        echo -e "${YELLOW}⚠️  Force merging (this will overwrite conflicts with main)${NC}"
        echo -e "${RED}This will lose any release-specific changes that conflict with main.${NC}"
        read -p "Are you sure? (y/N): " confirm
        
        if [[ $confirm == [yY] ]]; then
            echo -e "${BLUE}🔧 Force merging...${NC}"
            
            # Reset release to match main exactly
            git reset --hard origin/main
            git push origin release --force
            
            echo -e "${GREEN}✅ Force merge completed${NC}"
            echo -e "${GREEN}🚀 Release branch now matches main exactly${NC}"
        else
            echo -e "${YELLOW}❌ Force merge cancelled${NC}"
        fi
        ;;
        
    3)
        echo -e "${BLUE}🔄 Creating merge branch for manual resolution...${NC}"
        
        # Create a new branch for manual resolution
        MERGE_BRANCH="merge/main-to-release-$(date +%Y%m%d-%H%M%S)"
        git checkout -b "$MERGE_BRANCH"
        
        # Attempt merge to show conflicts
        if ! git merge origin/main --no-edit; then
            echo -e "${YELLOW}📋 Conflicts detected in:${NC}"
            git diff --name-only --diff-filter=U
            
            echo ""
            echo -e "${BLUE}📝 Next steps:${NC}"
            echo "1. Resolve conflicts in the files listed above"
            echo "2. Stage resolved files: git add ."
            echo "3. Complete the merge: git commit"  
            echo "4. Push the branch: git push origin $MERGE_BRANCH"
            echo "5. Create a PR from $MERGE_BRANCH to release"
            echo ""
            echo -e "${GREEN}You are now on branch: ${MERGE_BRANCH}${NC}"
            echo -e "${GREEN}Conflicts are ready for resolution.${NC}"
        else
            echo -e "${GREEN}✅ No conflicts! Merge completed successfully.${NC}"
            git push origin "$MERGE_BRANCH"
            echo -e "${BLUE}💡 Consider creating a PR from ${MERGE_BRANCH} to release${NC}"
        fi
        ;;
        
    4)
        echo -e "${YELLOW}❌ Operation cancelled${NC}"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Return to original branch
if [[ "$CURRENT_BRANCH" != "$(git rev-parse --abbrev-ref HEAD)" ]]; then
    echo -e "${BLUE}🔄 Returning to original branch: ${CURRENT_BRANCH}${NC}"
    git checkout "$CURRENT_BRANCH"
fi

echo -e "${GREEN}✅ Script completed${NC}"