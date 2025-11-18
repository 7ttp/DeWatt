/**
 * Production-level validation utilities
 */

import { isValidPublicKey } from '../solana';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: any;
}

/**
 * Validate and sanitize wallet address
 */
export function validateWallet(wallet: any): ValidationResult {
  if (!wallet) {
    return { valid: false, error: 'Wallet address is required' };
  }

  if (typeof wallet !== 'string') {
    return { valid: false, error: 'Wallet address must be a string' };
  }

  if (wallet.length < 32 || wallet.length > 44) {
    return { valid: false, error: 'Invalid wallet address length' };
  }

  if (!isValidPublicKey(wallet)) {
    return { valid: false, error: 'Invalid wallet address format' };
  }

  return { valid: true, sanitized: wallet.trim() };
}

/**
 * Validate numeric value with range
 */
export function validateNumber(
  value: any,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    fieldName?: string;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'Value';

  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  const num = Number(value);

  if (!Number.isFinite(num)) {
    return { valid: false, error: `${fieldName} must be a valid number` };
  }

  if (options.integer && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be an integer` };
  }

  if (options.min !== undefined && num < options.min) {
    return { valid: false, error: `${fieldName} must be at least ${options.min}` };
  }

  if (options.max !== undefined && num > options.max) {
    return { valid: false, error: `${fieldName} must be at most ${options.max}` };
  }

  return { valid: true, sanitized: num };
}

/**
 * Validate string with length constraints
 */
export function validateString(
  value: any,
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    fieldName?: string;
  } = {}
): ValidationResult {
  const fieldName = options.fieldName || 'Value';

  if (value === undefined || value === null) {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }

  const trimmed = value.trim();

  if (options.minLength !== undefined && trimmed.length < options.minLength) {
    return { valid: false, error: `${fieldName} must be at least ${options.minLength} characters` };
  }

  if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${options.maxLength} characters` };
  }

  if (options.pattern && !options.pattern.test(trimmed)) {
    return { valid: false, error: `${fieldName} has invalid format` };
  }

  return { valid: true, sanitized: trimmed };
}

/**
 * Validate charging session data
 */
export function validateChargingSession(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate wallet
  const walletResult = validateWallet(data.wallet);
  if (!walletResult.valid) {
    errors.push(walletResult.error!);
  }

  // Validate stationId
  const stationResult = validateString(data.stationId, {
    minLength: 1,
    maxLength: 100,
    fieldName: 'Station ID'
  });
  if (!stationResult.valid) {
    errors.push(stationResult.error!);
  }

  // Validate kwh
  const kwhResult = validateNumber(data.kwh, {
    min: 0.1,
    max: 1000,
    fieldName: 'kWh'
  });
  if (!kwhResult.valid) {
    errors.push(kwhResult.error!);
  }

  // Validate totalCost
  const costResult = validateNumber(data.totalCost, {
    min: 0.01,
    max: 10000,
    fieldName: 'Total cost'
  });
  if (!costResult.valid) {
    errors.push(costResult.error!);
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }

  return {
    valid: true,
    sanitized: {
      wallet: walletResult.sanitized,
      stationId: stationResult.sanitized,
      kwh: kwhResult.sanitized,
      totalCost: costResult.sanitized,
    }
  };
}

/**
 * Validate market purchase data
 */
export function validateMarketPurchase(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate wallet
  const walletResult = validateWallet(data.wallet);
  if (!walletResult.valid) {
    errors.push(walletResult.error!);
  }

  // Validate itemId
  const itemResult = validateString(data.itemId, {
    minLength: 1,
    maxLength: 100,
    fieldName: 'Item ID'
  });
  if (!itemResult.valid) {
    errors.push(itemResult.error!);
  }

  // Validate cost
  const costResult = validateNumber(data.cost, {
    min: 1,
    max: 1000000,
    integer: true,
    fieldName: 'Cost'
  });
  if (!costResult.valid) {
    errors.push(costResult.error!);
  }

  if (errors.length > 0) {
    return { valid: false, error: errors.join('; ') };
  }

  return {
    valid: true,
    sanitized: {
      wallet: walletResult.sanitized,
      itemId: itemResult.sanitized,
      cost: costResult.sanitized,
    }
  };
}

/**
 * Sanitize object by removing undefined/null values
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Rate limiter class for production use
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;
  private limit: number;
  private window: number;

  constructor(limit: number, windowMs: number) {
    this.requests = new Map();
    this.limit = limit;
    this.window = windowMs;
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const userLimit = this.requests.get(key);

    if (!userLimit || now > userLimit.resetTime) {
      const resetTime = now + this.window;
      this.requests.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: this.limit - 1, resetTime };
    }

    if (userLimit.count >= this.limit) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: userLimit.resetTime 
      };
    }

    userLimit.count++;
    return { 
      allowed: true, 
      remaining: this.limit - userLimit.count, 
      resetTime: userLimit.resetTime 
    };
  }

  reset(key: string): void {
    this.requests.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.requests.forEach((value, key) => {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.requests.delete(key));
  }
}
