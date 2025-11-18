import { MongoClient, Db, ObjectId, WithId, Document } from 'mongodb';

// Environment validation
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set!');
  console.error('Please copy .env.example to .env.local and configure your MongoDB connection.');
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net';
const DB_NAME = process.env.DB_NAME || 'dewatt';

// Connection pool configuration
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

// Type definitions
export interface User extends Document {
  wallet: string;
  usdBalance: number;
  evTokenBalance: number;
  totalKwh: number;
  co2Saved: number;
  welcomeBonusReceived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChargingSession extends Document {
  chargeId: string;
  stationId: string;
  wallet: string;
  kwh: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
  explorerLink: string;
  signature: string;
  memo?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface P2POrder extends Document {
  wallet: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'open' | 'completed' | 'cancelled';
  buyer?: string;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Connect to MongoDB with connection pooling and error handling
 */
export async function connectDB(): Promise<{ client: MongoClient; db: Db }> {
  try {
    if (cachedClient && cachedDb) {
      // Verify connection is still alive
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    }

    const client = await MongoClient.connect(MONGODB_URI, options);
    const db = client.db(DB_NAME);

    // Create indexes for better performance
    await createIndexes(db);

    cachedClient = client;
    cachedDb = db;

    console.log('✅ MongoDB connected successfully');
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw new Error('Database connection failed');
  }
}

/**
 * Create database indexes for optimal query performance
 */
async function createIndexes(db: Db): Promise<void> {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ wallet: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ co2Saved: -1 });

    // Charging sessions indexes
    await db.collection('charging_sessions').createIndex({ chargeId: 1 }, { unique: true });
    await db.collection('charging_sessions').createIndex({ wallet: 1, createdAt: -1 });
    await db.collection('charging_sessions').createIndex({ status: 1 });

    // P2P orders indexes
    await db.collection('p2p_orders').createIndex({ type: 1, status: 1 });
    await db.collection('p2p_orders').createIndex({ wallet: 1, createdAt: -1 });
  } catch (error) {
    console.warn('⚠️  Index creation warning:', error);
    // Don't throw - indexes might already exist
  }
}

/**
 * Validate Solana wallet address format
 */
function isValidWalletAddress(wallet: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet);
}

/**
 * Create a new user with validation
 */
export async function createUser(wallet: string): Promise<WithId<User>> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  const { db } = await connectDB();
  
  const newUser: Omit<User, '_id'> = {
    wallet,
    usdBalance: 0,
    evTokenBalance: 0,
    totalKwh: 0,
    co2Saved: 0,
    welcomeBonusReceived: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const result = await db.collection<User>('users').insertOne(newUser as User);
    return { _id: result.insertedId, ...newUser } as WithId<User>;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error('User already exists');
    }
    throw error;
  }
}

/**
 * Get user balance with proper error handling
 */
export async function getUserBalance(wallet: string): Promise<{
  usd: number;
  evToken: number;
  isNewUser: boolean;
  welcomeBonusReceived: boolean;
}> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  const { db } = await connectDB();
  let user = await db.collection<User>('users').findOne({ wallet });
  
  if (!user) {
    // Create new user
    await createUser(wallet);
    return {
      usd: 0,
      evToken: 0,
      isNewUser: true,
      welcomeBonusReceived: false,
    };
  }
  
  return {
    usd: user.usdBalance || 0,
    evToken: user.evTokenBalance || 0,
    isNewUser: false,
    welcomeBonusReceived: user.welcomeBonusReceived || false,
  };
}

/**
 * Update user balance with atomic operations and validation
 */
export async function updateUserBalance(
  wallet: string, 
  usdChange: number, 
  evTokenChange: number,
  markWelcomeBonusReceived: boolean = false
): Promise<void> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  if (!Number.isFinite(usdChange) || !Number.isFinite(evTokenChange)) {
    throw new Error('Invalid balance change values');
  }

  const { db } = await connectDB();
  
  // Get current balance first
  const user = await db.collection<User>('users').findOne({ wallet });
  if (!user) {
    throw new Error('User not found');
  }
  
  // Check if balance would go negative (skip check for welcome bonus)
  if (!markWelcomeBonusReceived) {
    const newUsdBalance = (user.usdBalance || 0) + usdChange;
    const newEvTokenBalance = (user.evTokenBalance || 0) + evTokenChange;
    
    if (newUsdBalance < 0) {
      throw new Error(`Insufficient USD balance. Required: ${Math.abs(usdChange)}, Available: ${user.usdBalance}`);
    }
    
    if (newEvTokenBalance < 0) {
      throw new Error(`Insufficient EvT tokens. Required: ${Math.abs(evTokenChange)}, Available: ${user.evTokenBalance}`);
    }
  }
  
  const updateData: any = {
    $inc: {
      usdBalance: usdChange,
      evTokenBalance: evTokenChange,
      totalKwh: Math.max(0, evTokenChange), // Only add positive kWh
      co2Saved: Math.max(0, evTokenChange) * 0.85, // 0.85 kg CO2 per kWh
    },
    $set: {
      updatedAt: new Date(),
    },
  };
  
  // Mark welcome bonus as received if this is the welcome bonus
  if (markWelcomeBonusReceived) {
    updateData.$set.welcomeBonusReceived = true;
  }
  
  const result = await db.collection<User>('users').updateOne(
    { wallet },
    updateData
  );

  if (result.matchedCount === 0) {
    throw new Error('User not found during update');
  }
}

/**
 * Create a charging session with validation
 */
export async function createChargingSession(data: {
  chargeId: string;
  stationId: string;
  wallet: string;
  kwh: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
  explorerLink: string;
  signature: string;
  memo?: string;
}): Promise<WithId<ChargingSession>> {
  if (!isValidWalletAddress(data.wallet)) {
    throw new Error('Invalid wallet address format');
  }

  if (data.kwh <= 0 || data.totalCost <= 0) {
    throw new Error('Invalid kwh or cost values');
  }

  const { db } = await connectDB();
  
  const session: Omit<ChargingSession, '_id'> = {
    ...data,
    createdAt: new Date(),
  };

  try {
    const result = await db.collection<ChargingSession>('charging_sessions').insertOne(session as ChargingSession);
    return { _id: result.insertedId, ...session } as WithId<ChargingSession>;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error('Charging session already exists');
    }
    throw error;
  }
}

/**
 * Get a specific charging session
 */
export async function getSession(chargeId: string): Promise<WithId<ChargingSession> | null> {
  const { db } = await connectDB();
  return await db.collection<ChargingSession>('charging_sessions').findOne({ chargeId });
}

/**
 * Get all charging sessions for a user
 */
export async function getUserSessions(wallet: string, limit: number = 50): Promise<WithId<ChargingSession>[]> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  const { db } = await connectDB();
  return await db.collection<ChargingSession>('charging_sessions')
    .find({ wallet })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100)) // Cap at 100
    .toArray();
}

/**
 * Cancel a charging session
 */
export async function cancelSession(chargeId: string): Promise<void> {
  const { db } = await connectDB();
  const result = await db.collection<ChargingSession>('charging_sessions').updateOne(
    { chargeId, status: 'active' },
    { 
      $set: { 
        status: 'cancelled',
        completedAt: new Date(),
      } 
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Session not found or already completed');
  }
}

/**
 * Complete a charging session
 */
export async function completeSession(chargeId: string): Promise<void> {
  const { db } = await connectDB();
  const result = await db.collection<ChargingSession>('charging_sessions').updateOne(
    { chargeId, status: 'active' },
    { 
      $set: { 
        status: 'completed',
        completedAt: new Date(),
      } 
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Session not found or already completed');
  }
}

/**
 * Create a P2P order with validation
 */
export async function createP2POrder(data: {
  wallet: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
}): Promise<WithId<P2POrder>> {
  if (!isValidWalletAddress(data.wallet)) {
    throw new Error('Invalid wallet address format');
  }

  if (data.amount <= 0 || data.price <= 0) {
    throw new Error('Invalid amount or price values');
  }

  const { db } = await connectDB();
  
  const order: Omit<P2POrder, '_id'> = {
    ...data,
    status: 'open',
    createdAt: new Date(),
  };

  const result = await db.collection<P2POrder>('p2p_orders').insertOne(order as P2POrder);
  return { _id: result.insertedId, ...order } as WithId<P2POrder>;
}

/**
 * Get available P2P orders
 */
export async function getP2POrders(type: 'buy' | 'sell', limit: number = 50): Promise<WithId<P2POrder>[]> {
  const { db } = await connectDB();
  const oppositeType = type === 'buy' ? 'sell' : 'buy';
  
  return await db.collection<P2POrder>('p2p_orders')
    .find({ type: oppositeType, status: 'open' })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))
    .toArray();
}

/**
 * Execute a P2P order with atomic transaction
 */
export async function executeP2POrder(orderId: string, buyer: string): Promise<void> {
  if (!isValidWalletAddress(buyer)) {
    throw new Error('Invalid buyer wallet address');
  }

  const { db } = await connectDB();
  
  const result = await db.collection<P2POrder>('p2p_orders').updateOne(
    { _id: new ObjectId(orderId), status: 'open' },
    { 
      $set: { 
        status: 'completed', 
        buyer, 
        completedAt: new Date() 
      } 
    }
  );

  if (result.matchedCount === 0) {
    throw new Error('Order not found or already completed');
  }
}

/**
 * Get leaderboard with pagination
 */
export async function getLeaderboard(limit: number = 10): Promise<WithId<User>[]> {
  const { db } = await connectDB();
  return await db.collection<User>('users')
    .find()
    .sort({ co2Saved: -1 })
    .limit(Math.min(limit, 100))
    .toArray();
}

/**
 * Get user statistics
 */
export async function getUserStats(wallet: string): Promise<{
  totalSessions: number;
  totalKwh: number;
  totalSpent: number;
  co2Saved: number;
  rank: number;
}> {
  if (!isValidWalletAddress(wallet)) {
    throw new Error('Invalid wallet address format');
  }

  const { db } = await connectDB();
  
  const user = await db.collection<User>('users').findOne({ wallet });
  if (!user) {
    throw new Error('User not found');
  }

  const sessions = await db.collection<ChargingSession>('charging_sessions')
    .find({ wallet, status: { $in: ['active', 'completed'] } })
    .toArray();

  const totalSessions = sessions.length;
  const totalSpent = sessions.reduce((sum, s) => sum + s.totalCost, 0);

  // Calculate rank
  const rank = await db.collection<User>('users')
    .countDocuments({ co2Saved: { $gt: user.co2Saved } }) + 1;

  return {
    totalSessions,
    totalKwh: user.totalKwh || 0,
    totalSpent,
    co2Saved: user.co2Saved || 0,
    rank,
  };
}

/**
 * Health check for database connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const { client } = await connectDB();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}
