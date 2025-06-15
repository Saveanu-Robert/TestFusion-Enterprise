# Environment Variables Encryption Guide 🔐

This project uses an encryption-based approach to store sensitive configuration values directly in the `.env` file instead of relying on CI/CD environment variables.

## How It Works

1. **Sensitive values** are encrypted using AES-256-GCM encryption
2. **Encrypted values** are stored in `.env` with the prefix `ENC:`
3. **At runtime**, the CI/CD pipeline decrypts these values using a single encryption key
4. **All configuration** (including secrets) is managed in one place: the `.env` file

## Benefits

- ✅ **Single source of truth**: All configuration in `.env`
- ✅ **Version controlled**: Configuration changes are tracked in git
- ✅ **Secure**: Sensitive values are encrypted
- ✅ **Portable**: Works across all environments (local, CI/CD, different providers)
- ✅ **Maintainable**: No need to manage dozens of environment variables

## Setup Instructions

### 1. Generate Encryption Key

```bash
node scripts/env-crypto.js generate-key
```

This will output a base64-encoded key. **Keep this secure!**

### 2. Store Key as Secret

Add the generated key as a GitHub secret named `ENV_ENCRYPTION_KEY`:

1. Go to your repository settings
2. Navigate to Secrets and variables → Actions
3. Add new repository secret:
   - Name: `ENV_ENCRYPTION_KEY`
   - Value: The key generated in step 1

### 3. Encrypt Sensitive Values

For each sensitive value in `.env`, encrypt it:

```bash
# Encrypt a value
node scripts/env-crypto.js encrypt "your-actual-secret-value"

# This outputs something like:
# ENC:abc123...:def456...:ghi789...
```

### 4. Update .env File

Replace the placeholder values with encrypted ones:

```bash
# Before
BROWSERSTACK_ACCESS_KEY=your_access_key_here

# After
BROWSERSTACK_ACCESS_KEY=ENC:abc123...:def456...:ghi789...
```

## Usage Examples

### Encrypting Values

```bash
# Encrypt BrowserStack access key
node scripts/env-crypto.js encrypt "your-browserstack-key"

# Encrypt API key
node scripts/env-crypto.js encrypt "your-api-key"

# Encrypt any sensitive value
node scripts/env-crypto.js encrypt "any-secret-value"
```

### Decrypting Values (for testing)

```bash
# Decrypt a single value
node scripts/env-crypto.js decrypt "ENC:abc123...:def456...:ghi789..."

# Process entire .env file (what CI/CD does)
node scripts/env-crypto.js process-env .env
```

## Security Features

- **AES-256-GCM encryption**: Industry-standard encryption
- **Unique IV per value**: Each encrypted value uses a unique initialization vector
- **Authentication**: Built-in authentication prevents tampering
- **No key storage**: The encryption key is never stored in the repository

## CI/CD Integration

The workflows automatically:

1. Load the encryption key from `ENV_ENCRYPTION_KEY` secret
2. Process the `.env` file to decrypt `ENC:` prefixed values
3. Export all variables for use in subsequent steps
4. Mask sensitive values in logs

## File Structure

```
├── .env                      # Configuration with encrypted secrets
├── scripts/
│   └── env-crypto.js        # Encryption/decryption utility
└── .github/workflows/
    ├── pr-tests.yml         # PR testing workflow
    ├── manual-tests.yml     # Manual testing workflow
    └── dependency-bot.yml   # Dependency checking workflow
```

## Local Development

For local development, you have two options:

1. **Use encrypted values**: Set `ENV_ENCRYPTION_KEY` environment variable
2. **Use default key**: The script includes a default key for development (not secure for production)

## Troubleshooting

### Decryption Fails

- Ensure `ENV_ENCRYPTION_KEY` is set correctly
- Verify the encrypted value format: `ENC:iv:tag:encrypted`
- Check that the key used for encryption matches the key used for decryption

### CI/CD Issues

- Verify `ENV_ENCRYPTION_KEY` secret is set in GitHub
- Check that `.env` file is committed to git
- Ensure `scripts/env-crypto.js` is executable

### Testing Encryption

```bash
# Test the entire flow
node scripts/env-crypto.js encrypt "test-value"
# Copy the ENC:... output
node scripts/env-crypto.js decrypt "ENC:..."
# Should output "test-value"
```

## Best Practices

1. **Generate unique keys** for each environment/repository
2. **Rotate keys periodically** (re-encrypt all values with new key)
3. **Never commit** the raw encryption key to git
4. **Use descriptive comments** in `.env` for encrypted values
5. **Test locally** before committing encrypted values

## Migration from Environment Variables

1. Identify all environment variables used in workflows
2. Move them to `.env` file with placeholder values
3. Encrypt sensitive values using the utility
4. Update workflows to use the new decryption process
5. Remove environment variables from CI/CD settings

## Security Considerations

- The encryption key is the single point of failure - protect it well
- Encrypted values in git are only as secure as your encryption key
- Consider key rotation strategy for long-term projects
- Audit access to the encryption key secret regularly
