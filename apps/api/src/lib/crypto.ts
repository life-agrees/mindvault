import crypto from 'crypto';

/**
 * Encrypts a string using AES-256-GCM.
 * @param plaintext The text to encrypt
 * @param keyHex The 256-bit key represented as a 64-character hex string
 * @returns Serialized format: ivHex:tagHex:ciphertextHex
 */
export function encryptAES(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${ciphertext}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * @param encryptedStr Serialized format: ivHex:tagHex:ciphertextHex
 * @param keyHex The 256-bit key represented as a 64-character hex string
 * @returns The decrypted plaintext string
 */
export function decryptAES(encryptedStr: string, keyHex: string): string {
  const [ivHex, tagHex, ciphertextHex] = encryptedStr.split(':');
  if (!ivHex || !tagHex || !ciphertextHex) {
    throw new Error('Invalid encrypted string format');
  }
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let plaintext = decipher.update(ciphertext, undefined, 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}
