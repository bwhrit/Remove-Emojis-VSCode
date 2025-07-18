#!/bin/bash

# Release script for Remove Emojis VS Code Extension
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version type is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version type not provided${NC}"
    echo "Usage: $0 [patch|minor|major]"
    exit 1
fi

VERSION_TYPE=$1

# Validate version type
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}Error: Invalid version type '$VERSION_TYPE'${NC}"
    echo "Valid types: patch, minor, major"
    exit 1
fi

echo -e "${GREEN}Starting release process...${NC}"

# Check if working directory is clean
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}Error: Working directory is not clean${NC}"
    echo "Please commit or stash your changes before releasing"
    exit 1
fi

# Make sure we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Warning: Not on main branch (currently on $CURRENT_BRANCH)${NC}"
    read -p "Do you want to continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull latest changes
echo -e "${GREEN}Pulling latest changes...${NC}"
git pull origin main

# Run tests
echo -e "${GREEN}Running tests...${NC}"
pnpm test

# Build the extension
echo -e "${GREEN}Building extension...${NC}"
pnpm run package

# Update version
echo -e "${GREEN}Updating version ($VERSION_TYPE)...${NC}"
npm version $VERSION_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: v$NEW_VERSION${NC}"

# Update CHANGELOG.md
echo -e "${YELLOW}Please update CHANGELOG.md for version $NEW_VERSION${NC}"
echo "Opening CHANGELOG.md in your editor..."

# Try to open in VS Code, fall back to default editor
if command -v code &> /dev/null; then
    code CHANGELOG.md
elif [ -n "$EDITOR" ]; then
    $EDITOR CHANGELOG.md
else
    echo -e "${YELLOW}Please manually update CHANGELOG.md${NC}"
fi

read -p "Press enter when you've updated CHANGELOG.md..."

# Commit changes
echo -e "${GREEN}Committing changes...${NC}"
git add package.json package-lock.json CHANGELOG.md
git commit -m "Release v$NEW_VERSION"

# Create tag
echo -e "${GREEN}Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tag
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo -e "${GREEN}✅ Release v$NEW_VERSION initiated!${NC}"
echo ""
echo "The CI/CD pipeline will now:"
echo "1. Run tests on all platforms"
echo "2. Build and package the extension"
echo "3. Publish to VS Code Marketplace"
echo "4. Create a GitHub release"
echo ""
echo -e "${YELLOW}Monitor the progress at:${NC}"
echo "https://github.com/your-username/remove-emojis/actions"