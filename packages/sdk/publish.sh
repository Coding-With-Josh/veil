#!/bin/bash

# TOSS SDK Publishing Script
# Flexible version publishing for any version number

set -e

# Get version from command line or use patch bump
VERSION="${1:-patch}"

echo " Veil SDK Publishing Process"
echo "================================"
echo ""

# Determine the new version
if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEW_VERSION="$VERSION"
  echo "Using specified version: $NEW_VERSION"
else
  case "$VERSION" in
    major|minor|patch)
      echo "Bumping $VERSION version..."
      ;;
    *)
      echo " Invalid version format. Use 'major', 'minor', 'patch', or 'X.Y.Z'"
      exit 1
      ;;
  esac
fi

echo ""

# Step 1: Verify everything is ready
echo "✓ Step 1: Verifying code quality..."
npm run typecheck > /dev/null 2>&1 && echo "   TypeScript check passed" || { echo "   TypeScript errors found"; exit 1; }

# Step 2: Check git status
echo ""
echo "✓ Step 2: Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
  echo "   Working directory clean"
else
  echo "  ️  Uncommitted changes detected:"
  git status --short
  read -p "  Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Step 3: Update version
echo ""
echo "✓ Step 3: Updating version..."
npm version "$VERSION" > /dev/null 2>&1
CURRENT_VERSION=$(npm pkg get version | tr -d '"')
echo "   Version updated to $CURRENT_VERSION"

# Step 4: Rebuild
echo ""
echo "✓ Step 4: Building distribution..."
npm run clean > /dev/null 2>&1 || true
npm run prepare > /dev/null 2>&1
echo "   Build completed"

# Step 5: Verify build
echo ""
echo "✓ Step 5: Verifying build artifacts..."
if [ -f "dist/index.js" ] && [ -f "dist/index.d.ts" ]; then
  echo "   Build artifacts present"
else
  echo "   Build artifacts missing"
  exit 1
fi

# Step 6: Check npm login
echo ""
echo "✓ Step 6: Checking npm authentication..."
if npm whoami > /dev/null 2>&1; then
  USER=$(npm whoami)
  echo "   Logged in as: $USER"
else
  echo "  ️  Not authenticated with npm"
  echo "  Please run: npm login"
  exit 1
fi

# Step 7: Dry run
echo ""
echo "✓ Step 7: Running dry run..."
npm publish --dry-run > /dev/null 2>&1
echo "   Dry run successful"

# Step 8: Confirm before publishing
echo ""
read -p "Ready to publish @veil-hq/sdk@$CURRENT_VERSION to npm? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "   Publishing cancelled"
  exit 1
fi

echo ""
echo "✓ Step 8: Publishing to npm..."
npm publish
echo "   Published successfully!"

# Step 9: Verify on npm
echo ""
echo "✓ Step 9: Verifying publication..."
sleep 3
npm view @veil-hq/sdk@"$CURRENT_VERSION" > /dev/null 2>&1
echo "   Version $CURRENT_VERSION visible on npm registry"

# Step 10: Create git tag
echo ""
echo "✓ Step 10: Creating git tag..."
git tag -a "v$CURRENT_VERSION" -m "Production release v$CURRENT_VERSION" > /dev/null 2>&1 || true
echo "   Tag created: v$CURRENT_VERSION"

# Step 11: Push to GitHub
echo ""
echo "✓ Step 11: Pushing to GitHub..."
git push origin main > /dev/null 2>&1
git push origin "v$CURRENT_VERSION" > /dev/null 2>&1 || true
echo "   Pushed to GitHub"

echo ""
echo "================================"
echo " Publishing Complete!"
echo ""
echo " Package Info:"
echo "   Name:    @veil-hq/sdk"
echo "   Version: $CURRENT_VERSION"
echo "   URL:     https://www.npmjs.com/package/@veil-hq/sdk"
echo ""
echo " Next steps:"
echo "   1. Create GitHub release: https://github.com/Coding-With-Josh/veil/releases"
echo "   2. Announce on social media"
echo "   3. Notify stakeholders"
echo ""
echo "   Version: $CURRENT_VERSION"
echo "   URL:     https://www.npmjs.com/package/@veil-hq/sdk"
echo ""
echo " Next steps:"
echo "   1. Push to GitHub: git push origin main && git push origin v$CURRENT_VERSION"
echo "   2. Create release on GitHub"
echo "   3. Announce on social media"
echo ""
