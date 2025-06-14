# 🔧 Setting up the Dependency Bot

The dependency bot requires a Personal Access Token (PAT) to push branches and create pull requests.

## 📋 Setup Instructions

### Step 1: Create a Personal Access Token

1. Go to GitHub.com → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Fill in the details:
   - **Note**: `TestFusion Dependency Bot`
   - **Expiration**: 1 year (recommended)
   - **Scopes** (select these):
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (if you publish packages)

### Step 2: Add PAT as Repository Secret

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Fill in:
   - **Name**: `DEPENDENCY_BOT_TOKEN`
   - **Secret**: Your PAT from Step 1

### Step 3: Verify Configuration

The workflow is already configured to use `secrets.DEPENDENCY_BOT_TOKEN`. Once you've added the secret, the dependency bot should work correctly.

## 🔄 How it Works

- **Automatic**: Runs weekdays at 7:00 AM UTC
- **Manual**: Can be triggered via "Actions" → "Dependency Bot" → "Run workflow"
- **Smart**: Only creates PRs when dependencies actually need updates
- **Safe**: Runs all tests and marks PR status accordingly

## 🚨 Troubleshooting

- **403 Permission Error**: Ensure your PAT has the right scopes and the repository secret is named correctly
- **Token Expired**: Generate a new PAT and update the repository secret
- **Missing Permissions**: Check that the PAT has `repo` and `workflow` scopes

## 📊 What the Bot Does

1. **Checks** for outdated dependencies using `npm-check-updates`
2. **Creates** a branch with updates (if any)
3. **Tests** the updates with full test suite
4. **Creates** a PR with detailed summary and test results
5. **Labels** the PR appropriately based on test results
