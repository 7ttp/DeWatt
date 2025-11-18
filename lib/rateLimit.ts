/**
 * Rate limiting middleware for API routes
 * Prevents abuse by limiting requests per IP address
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

/**
 * Default rate limit configuration
 */
export const defaultRateLimitConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later.',
};

/**
 * Stricter rate limit for sensitive operations
 */
export const strictRateLimitConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Rate limit exceeded. Please wait before trying again.',
};

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Check if request exceeds rate limit
 */
export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = defaultRateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = store[ip];

  // Clean expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  // First request or expired window
  if (!record || now > record.resetTime) {
    store[ip] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: store[ip].resetTime,
    };
  }

  // Increment count
  record.count++;

  // Check if limit exceeded
  if (record.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  Object.keys(store).forEach(ip => {
    if (store[ip].resetTime < now) {
      delete store[ip];
    }
  });
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  config: RateLimitConfig = defaultRateLimitConfig
) {
  return async (request: Request): Promise<Response> => {
    const ip = getClientIp(request);
    const { allowed, remaining, resetTime } = checkRateLimit(ip, config);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    headers.set('X-RateLimit-Remaining', remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      return new Response(
        JSON.stringify({
          success: false,
          error: config.message || 'Rate limit exceeded',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(headers),
          },
        }
      );
    }

    // Execute handler and add rate limit headers to response
    const response = await handler(request);
    Object.entries(Object.fromEntries(headers)).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

/**
 * Reset rate limit for specific IP (useful for testing)
 */
export function resetRateLimit(ip: string): void {
  delete store[ip];
}

/**
 * Get current rate limit status for IP
 */
export function getRateLimitStatus(ip: string, config: RateLimitConfig = defaultRateLimitConfig) {
  const record = store[ip];
  const now = Date.now();

  if (!record || now > record.resetTime) {
    return {
      count: 0,
      remaining: config.maxRequests,
      resetTime: null,
    };
  }

  return {
    count: record.count,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime,
  };
}
