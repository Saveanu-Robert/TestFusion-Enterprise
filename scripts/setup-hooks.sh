#!/usr/bin/env bash

# Git Hooks Setup Script for TestFusion-Enterprise
# This script sets up git hooks for code quality enforcement

set -e

echo "🔧 Setting up Git hooks for TestFusion-Enterprise..."

# Check if husky is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx is required but not installed. Please install Node.js"
    exit 1
fi

# Initialize husky
echo "📦 Initializing Husky..."
npx husky install

# Create pre-commit hook
echo "🚀 Creating pre-commit hook..."
npx husky add .husky/pre-commit "npx lint-staged"

# Create commit-msg hook for conventional commits
echo "📝 Creating commit-msg hook..."
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check commit message format
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Commit message should follow conventional commits format:"
    echo "  <type>[optional scope]: <description>"
    echo ""
    echo "Examples:"
    echo "  feat: add new API endpoint"
    echo "  fix(auth): resolve login issue"
    echo "  docs: update README"
    echo "  test: add user validation tests"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
    exit 1
fi
EOF

chmod +x .husky/commit-msg

# Create pre-push hook
echo "🚀 Creating pre-push hook..."
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."
npm run validate
EOF

chmod +x .husky/pre-push

# Create post-merge hook
echo "🔄 Creating post-merge hook..."
cat > .husky/post-merge << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔄 Post-merge hook: Checking for dependency changes..."

# Check if package-lock.json changed
if git diff --name-only HEAD@{1} HEAD | grep -q "package-lock.json"; then
    echo "📦 Dependencies changed, running npm ci..."
    npm ci
fi

# Check if Playwright dependencies might need updating
if git diff --name-only HEAD@{1} HEAD | grep -qE "(package\.json|playwright\.config\.ts)"; then
    echo "🎭 Playwright config may have changed, consider running:"
    echo "    npm run install:browsers"
fi
EOF

chmod +x .husky/post-merge

echo "✅ Git hooks setup completed!"
echo ""
echo "The following hooks are now active:"
echo "  • pre-commit: Runs lint-staged (linting + formatting)"
echo "  • commit-msg: Enforces conventional commit format"
echo "  • pre-push: Runs full validation (typecheck + lint + tests)"
echo "  • post-merge: Handles dependency updates"
echo ""
echo "Happy coding! 🚀"
