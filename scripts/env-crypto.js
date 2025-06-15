#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');

class SimpleEnvCrypto {
  constructor() {
    this.defaultKey = 'testkey123456789';
  }

  generateKey() {
    const key = crypto.randomBytes(32).toString('base64');
    console.log('Generated new encryption key:');
    console.log(key);
    console.log('');
    console.log('To use this key:');
    console.log('1. Set ENV_ENCRYPTION_KEY as a GitHub secret with this value');
    console.log('2. Or export ENV_ENCRYPTION_KEY in your local environment');
    console.log('');
    console.log('Keep this key secure and never commit it to git!');
    return key;
  }

  getKey() {
    if (process.env.ENV_ENCRYPTION_KEY) {
      return process.env.ENV_ENCRYPTION_KEY;
    }
    console.log('Using default encryption key. Use generate-key for production.');
    return this.defaultKey;
  }

  encrypt(plaintext) {
    if (!plaintext) {
      throw new Error('Plaintext is required');
    }

    const key = this.getKey();
    let encrypted = '';
    for (let i = 0; i < plaintext.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const plainChar = plaintext.charCodeAt(i);
      encrypted += String.fromCharCode(plainChar ^ keyChar);
    }
    
    const result = Buffer.from(encrypted).toString('base64');
    console.log('Encrypted value:');
    console.log(`ENC:${result}`);
    console.log('');
    console.log('Use this in your .env file like:');
    console.log(`SECRET_VALUE=ENC:${result}`);
    return result;
  }

  decrypt(encryptedData) {
    if (!encryptedData) {
      throw new Error('Encrypted data is required');
    }

    const cleanData = encryptedData.startsWith('ENC:') ? encryptedData.substring(4) : encryptedData;
    const key = this.getKey();
    const encrypted = Buffer.from(cleanData, 'base64').toString();
    
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = key.charCodeAt(i % key.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    
    return decrypted;
  }

  processEnvContent(content) {
    const lines = content.split('\n');
    const processedLines = [];
    
    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) {
        processedLines.push(line);
        continue;
      }

      if (line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');

        if (value.startsWith('ENC:')) {
          try {
            const decryptedValue = this.decrypt(value);
            processedLines.push(`${key}=${decryptedValue}`);
          } catch (error) {
            console.error(`Failed to decrypt ${key}: ${error.message}`);
            processedLines.push(line);
          }
        } else {
          processedLines.push(line);
        }
      } else {
        processedLines.push(line);
      }
    }

    return processedLines.join('\n');
  }

  processEnvFile(envPath = '.env') {
    if (!fs.existsSync(envPath)) {
      throw new Error(`.env file not found at ${envPath}`);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const decryptedContent = this.processEnvContent(envContent);
    console.log(decryptedContent);
  }
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const envCrypto = new SimpleEnvCrypto();
  
  try {
    switch (command) {
      case 'generate-key':
        envCrypto.generateKey();
        break;
        
      case 'encrypt':
        const plaintext = args[1];
        if (!plaintext) {
          console.error('Error: Please provide a value to encrypt');
          console.log('Usage: node scripts/env-crypto.js encrypt "your-secret-value"');
          process.exit(1);
        }
        envCrypto.encrypt(plaintext);
        break;
        
      case 'decrypt':
        const encrypted = args[1];
        if (!encrypted) {
          console.error('Error: Please provide a value to decrypt');
          console.log('Usage: node scripts/env-crypto.js decrypt "encrypted-value"');
          process.exit(1);
        }
        const decrypted = envCrypto.decrypt(encrypted);
        console.log('Decrypted value:');
        console.log(decrypted);
        break;
        
      case 'process-env':
        const envPath = args[1] || '.env';
        envCrypto.processEnvFile(envPath);
        break;
        
      default:
        console.log('Environment Variables Encryption Utility');
        console.log('');
        console.log('Commands:');
        console.log('  generate-key                    Generate a new encryption key');
        console.log('  encrypt "value"                 Encrypt a value');
        console.log('  decrypt "encrypted-value"       Decrypt a value');
        console.log('  process-env [path]              Process .env file (default: .env)');
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/env-crypto.js generate-key');
        console.log('  node scripts/env-crypto.js encrypt "my-api-key"');
        console.log('  node scripts/env-crypto.js decrypt "ENC:abc123..."');
        console.log('  node scripts/env-crypto.js process-env .env');
        break;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleEnvCrypto;