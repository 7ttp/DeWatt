/**
 * Input validation utilities
 * Provides helpers for validating user inputs across the application
 */

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Solana wallet address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters
  const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solanaRegex.test(address);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate coordinate bounds
 */
export function isValidLatitude(lat: number): boolean {
  return typeof lat === 'number' && !isNaN(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lng: number): boolean {
  return typeof lng === 'number' && !isNaN(lng) && lng >= -180 && lng <= 180;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength = 500): string {
  return input.trim().slice(0, maxLength);
}

/**
 * Validate kWh value
 */
export function isValidKwh(kwh: number): boolean {
  return isPositiveNumber(kwh) && kwh <= 1000; // Max 1000 kWh per session
}

/**
 * Validate station ID format
 */
export function isValidStationId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id);
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

/**
 * Check if string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate price value
 */
export function isValidPrice(price: number): boolean {
  return isPositiveNumber(price) && price < 1000000;
}
