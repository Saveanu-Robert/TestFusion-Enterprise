# GitHub Actions Permissions Fix

## Issue Description

The GitHub Actions workflow was failing with the following error:

```
RequestError [HttpError]: Resource not accessible by integration
```

This error occurred when the workflow tried to create commit comments using the `github-script` action.

## Root Cause

The error was caused by insufficient permissions in the GitHub Actions workflow. The workflow was trying to:

1. Create commit comments via the GitHub API
2. Access repository resources without explicit permissions

GitHub Actions workflows have restricted permissions by default for security reasons.

## Solutions Implemented

### 1. Added Explicit Permissions

Added explicit permissions to all workflow files:

**Manual Tests Workflow** (`manual-tests.yml`):
```yaml
permissions:
  contents: read
  actions: read
  checks: write
  pull-requests: write
  issues: write
```

**PR Tests Workflow** (`pr-tests.yml`):
```yaml
permissions:
  contents: read
  actions: read
  checks: write
  pull-requests: write
```

**Dependency Bot Workflow** (`dependency-bot.yml`):
```yaml
permissions:
  contents: read
  actions: read
  issues: write
  pull-requests: read
```

### 2. Replaced Commit Comments with Job Summaries

Instead of creating commit comments (which require additional permissions), the manual tests workflow now:

1. **Generates a test summary file** - Creates a markdown file with test results
2. **Uploads the summary as an artifact** - Makes it available for download
3. **Uses GitHub's job summary feature** - Displays results directly in the workflow run page

### 3. Benefits of the New Approach

- **Better Security**: Uses minimal required permissions
- **Better UX**: Results are displayed directly in the GitHub Actions interface
- **Persistent Storage**: Test summaries are stored as artifacts
- **No API Limitations**: Doesn't rely on GitHub API rate limits

## Files Modified

1. `.github/workflows/manual-tests.yml` - Complete rewrite with proper permissions and job summaries
2. `.github/workflows/pr-tests.yml` - Added explicit permissions
3. `.github/workflows/dependency-bot.yml` - Added explicit permissions

## How to View Test Results

### Manual Tests
1. Go to the Actions tab in the repository
2. Click on the manual test workflow run
3. View the job summary directly in the interface
4. Download artifacts for detailed reports

### PR Tests
Test results are automatically uploaded as artifacts and can be downloaded from the workflow run page.

### Dependency Bot
Creates GitHub issues automatically when security vulnerabilities are detected.

## Testing the Fix

To test the fix:

1. Trigger a manual workflow run from the Actions tab
2. Select test type, browser, and environment
3. Monitor the workflow execution
4. Verify that no permission errors occur
5. Check that the job summary displays correctly
6. Verify artifacts are uploaded successfully

## Prevention

To prevent similar issues in the future:

1. **Always specify explicit permissions** in GitHub Actions workflows
2. **Use job summaries** instead of commit comments when possible
3. **Test workflows** in a development environment before merging
4. **Monitor workflow runs** for permission-related errors

## Permissions Reference

| Permission | Purpose |
|------------|---------|
| `contents: read` | Read repository files and content |
| `actions: read` | Read workflow run information |
| `checks: write` | Create check runs and status checks |
| `pull-requests: write` | Comment on and modify pull requests |
| `issues: write` | Create and modify issues |

## Related Documentation

- [GitHub Actions Permissions](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Job Summaries](https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary)
