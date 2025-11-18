/**
 * Environment variable validation
 * Ensures all required environment variables are set on startup
 */

interface EnvConfig {
  MONGODB_URI: string;
  DB_NAME: string;
  SOLANA_RPC_URL: string;
  TREASURY_SECRET_KEY?: string;
  ADMIN_API_KEY?: string;
  CONTACT_RECIPIENTS?: string;
  NODE_ENV: string;
}

const requiredEnvVars = [
  'MONGODB_URI',
  'DB_NAME',
  'SOLANA_RPC_URL',
] as const;

const optionalEnvVars = [
  'TREASURY_SECRET_KEY',
  'ADMIN_API_KEY',
  'CONTACT_RECIPIENTS',
] as const;

/**
 * Validate environment variables
 * @throws Error if required variables are missing
 */
export function validateEnv(): EnvConfig {
  const missing: string[] = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Warn about optional variables
  const missingOptional: string[] = [];
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      missingOptional.push(varName);
    }
  }

  if (missingOptional.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `Warning: Optional environment variables not set: ${missingOptional.join(', ')}\n` +
      'Some features may not work correctly.'
    );
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI!,
    DB_NAME: process.env.DB_NAME!,
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL!,
    TREASURY_SECRET_KEY: process.env.TREASURY_SECRET_KEY,
    ADMIN_API_KEY: process.env.ADMIN_API_KEY,
    CONTACT_RECIPIENTS: process.env.CONTACT_RECIPIENTS,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

/**
 * Get validated environment config
 */
export function getEnvConfig(): EnvConfig {
  return validateEnv();
}
