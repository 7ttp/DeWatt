/**
 * Production environment configuration with validation
 */

export interface AppConfig {
  // Database
  mongodbUri: string;
  dbName: string;

  // Solana
  solanaRpcUrl: string;
  treasurySecretKey?: string;

  // API
  apiUrl: string;
  adminApiKey?: string;

  // Features
  enableWelcomeBonus: boolean;
  enableP2P: boolean;
  enableMarketplace: boolean;

  // Limits
  maxChargingKwh: number;
  maxChargingCost: number;
  maxMarketplaceCost: number;

  // Rate limiting
  rateLimitWindow: number;
  rateLimitMax: number;

  // Cache
  cacheEnabled: boolean;
  cacheTtl: number;

  // Environment
  nodeEnv: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Load and validate environment configuration
 */
function loadConfig(): AppConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  // Warn about missing MongoDB URI in development
  if (nodeEnv === 'development' && !process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set - using localhost fallback');
    console.warn('Copy .env.example to .env.local and configure your database connection');
  }

  const config: AppConfig = {
    // Database
    mongodbUri: process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net',
    dbName: process.env.DB_NAME || 'dewatt',

    // Solana
    solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    treasurySecretKey: process.env.TREASURY_SECRET_KEY,

    // API
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    adminApiKey: process.env.ADMIN_API_KEY,

    // Features
    enableWelcomeBonus: process.env.ENABLE_WELCOME_BONUS !== 'false',
    enableP2P: process.env.ENABLE_P2P !== 'false',
    enableMarketplace: process.env.ENABLE_MARKETPLACE !== 'false',

    // Limits
    maxChargingKwh: parseInt(process.env.MAX_CHARGING_KWH || '1000'),
    maxChargingCost: parseFloat(process.env.MAX_CHARGING_COST || '10000'),
    maxMarketplaceCost: parseInt(process.env.MAX_MARKETPLACE_COST || '1000000'),

    // Rate limiting
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '20'),

    // Cache
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    cacheTtl: parseInt(process.env.CACHE_TTL || '5000'),

    // Environment
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };

  // Validate required fields in production
  if (config.isProduction) {
    const requiredFields: (keyof AppConfig)[] = [
      'mongodbUri',
      'dbName',
      'solanaRpcUrl',
    ];

    const missing = requiredFields.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
    }

    // Warn about missing optional but recommended fields
    if (!config.treasurySecretKey) {
      console.warn('⚠️  TREASURY_SECRET_KEY not set - blockchain transactions will use mock signatures');
    }

    if (!config.adminApiKey) {
      console.warn('⚠️  ADMIN_API_KEY not set - admin endpoints will be unprotected');
    }
  }

  return config;
}

// Export singleton config
export const config = loadConfig();

/**
 * Get configuration value with type safety
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return config[key];
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: 'welcomeBonus' | 'p2p' | 'marketplace'): boolean {
  switch (feature) {
    case 'welcomeBonus':
      return config.enableWelcomeBonus;
    case 'p2p':
      return config.enableP2P;
    case 'marketplace':
      return config.enableMarketplace;
    default:
      return false;
  }
}

/**
 * Get rate limit configuration
 */
export function getRateLimitConfig(): { window: number; max: number } {
  return {
    window: config.rateLimitWindow,
    max: config.rateLimitMax,
  };
}

/**
 * Get validation limits
 */
export function getValidationLimits() {
  return {
    charging: {
      maxKwh: config.maxChargingKwh,
      maxCost: config.maxChargingCost,
    },
    marketplace: {
      maxCost: config.maxMarketplaceCost,
    },
  };
}

/**
 * Print configuration summary (for debugging)
 */
export function printConfigSummary(): void {
  console.log('📋 Configuration Summary:');
  console.log('  Environment:', config.nodeEnv);
  console.log('  Database:', config.dbName);
  console.log('  Solana RPC:', config.solanaRpcUrl);
  console.log('  Treasury configured:', !!config.treasurySecretKey);
  console.log('  Features:');
  console.log('    - Welcome Bonus:', config.enableWelcomeBonus);
  console.log('    - P2P Trading:', config.enableP2P);
  console.log('    - Marketplace:', config.enableMarketplace);
  console.log('  Limits:');
  console.log('    - Max Charging kWh:', config.maxChargingKwh);
  console.log('    - Max Charging Cost:', config.maxChargingCost);
  console.log('    - Max Marketplace Cost:', config.maxMarketplaceCost);
  console.log('  Rate Limiting:', `${config.rateLimitMax} requests per ${config.rateLimitWindow}ms`);
  console.log('  Cache:', config.cacheEnabled ? `Enabled (TTL: ${config.cacheTtl}ms)` : 'Disabled');
}

// Print config on startup in development
if (config.isDevelopment) {
  printConfigSummary();
}
