function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypts plaintext using AES-256-GCM with Web Crypto API.
 * @param plaintext Text to encrypt
 * @param keyHex 256-bit symmetric key represented as a 64-char hex string
 * @returns Serialized format: ivHex:tagHex:ciphertextHex
 */
export async function encryptAES(plaintext: string, keyHex: string): Promise<string> {
  const keyBytes = hexToBytes(keyHex);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    enc.encode(plaintext)
  );
  
  const fullBytes = new Uint8Array(encryptedBuffer);
  // Web Crypto appends the 16-byte authentication tag at the end
  const ciphertextBytes = fullBytes.slice(0, fullBytes.length - 16);
  const tagBytes = fullBytes.slice(fullBytes.length - 16);
  
  const ivHex = bytesToHex(iv);
  const tagHex = bytesToHex(tagBytes);
  const ciphertextHex = bytesToHex(ciphertextBytes);
  
  return `${ivHex}:${tagHex}:${ciphertextHex}`;
}

/**
 * Decrypts AES-256-GCM ciphertext using Web Crypto API.
 * @param encryptedStr Serialized format: ivHex:tagHex:ciphertextHex
 * @param keyHex 256-bit symmetric key represented as a 64-char hex string
 * @returns Decrypted plaintext string
 */
export async function decryptAES(encryptedStr: string, keyHex: string): Promise<string> {
  const [ivHex, tagHex, ciphertextHex] = encryptedStr.split(':');
  if (!ivHex || !tagHex || !ciphertextHex) {
    throw new Error('Invalid encrypted format');
  }
  
  const keyBytes = hexToBytes(keyHex);
  const iv = hexToBytes(ivHex);
  const tag = hexToBytes(tagHex);
  const ciphertext = hexToBytes(ciphertextHex);
  
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Web Crypto expects tag appended to ciphertext for GCM decryption
  const fullBytes = new Uint8Array(ciphertext.length + tag.length);
  fullBytes.set(ciphertext, 0);
  fullBytes.set(tag, ciphertext.length);
  
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    fullBytes
  );
  
  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Derives a 256-bit AES key from any seed string (e.g. signature, user DID) via SHA-256.
 * @param seed Seed string
 * @returns 64-character hex string representing 256-bit key
 */
export async function deriveKeyFromSignature(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
