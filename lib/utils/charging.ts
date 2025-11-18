import bs58 from 'bs58';

export function generateChargeId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CHG-${timestamp}-${random}`.toUpperCase();
}

export function generateValidSignature(): string {
  // Generate a valid Solana signature (64 bytes, base58 encoded)
  const randomBytes = new Uint8Array(64);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    // Node.js environment
    const crypto = require('crypto');
    crypto.randomFillSync(randomBytes);
  }
  return bs58.encode(randomBytes);
}

export function createExplorerLink(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
