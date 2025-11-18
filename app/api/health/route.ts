import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint for monitoring and load balancers
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: any = {
    api: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };

  // Check database connection
  try {
    const { healthCheck: dbHealthCheck } = await import('@/lib/db');
    checks.database = await dbHealthCheck() ? 'connected' : 'disconnected';
  } catch (error) {
    checks.database = 'error';
    checks.databaseError = process.env.NODE_ENV === 'development' ? String(error) : 'Connection failed';
  }

  // Check Solana connection
  try {
    const { healthCheck: solanaHealthCheck } = await import('@/lib/solana');
    const solanaHealth = await solanaHealthCheck();
    checks.blockchain = {
      status: solanaHealth.connected ? 'connected' : 'disconnected',
      blockHeight: solanaHealth.blockHeight,
      version: solanaHealth.version
    };
  } catch (error) {
    checks.blockchain = {
      status: 'error',
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Connection failed'
    };
  }

  // Check treasury balance
  try {
    const { getTreasuryBalance } = await import('@/lib/solana');
    const balance = await getTreasuryBalance();
    checks.treasury = {
      balance: balance,
      unit: 'SOL',
      funded: balance > 0.01
    };
  } catch (error) {
    checks.treasury = {
      status: 'error',
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Check failed'
    };
  }

  checks.responseTime = Date.now() - startTime;

  // Determine overall health status
  const isHealthy = 
    checks.database === 'connected' &&
    checks.blockchain.status === 'connected';

  const status = isHealthy ? 200 : 503;

  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'degraded',
    ...checks
  }, { 
    status,
    headers: {
      'Cache-Control': 'no-store',
    }
  });
}

/**
 * POST endpoint for detailed diagnostics (admin only in production)
 */
export async function POST(req: NextRequest) {
  // In production, add authentication here
  const authHeader = req.headers.get('authorization');
  const adminKey = process.env.ADMIN_API_KEY;

  if (adminKey && authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({
      error: 'Unauthorized'
    }, { status: 401 });
  }

  const startTime = Date.now();
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime(),
  };

  // Memory details
  const memUsage = process.memoryUsage();
  diagnostics.memory = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024),
    unit: 'MB'
  };

  // CPU usage (if available)
  if (process.cpuUsage) {
    const cpuUsage = process.cpuUsage();
    diagnostics.cpu = {
      user: cpuUsage.user,
      system: cpuUsage.system
    };
  }

  // Database diagnostics
  try {
    const { connectDB } = await import('@/lib/db');
    const { db } = await connectDB();
    
    const collections = await db.listCollections().toArray();
    diagnostics.database = {
      status: 'connected',
      collections: collections.map(c => c.name),
      collectionCount: collections.length
    };

    // Get collection stats
    const stats: any = {};
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        stats[collection.name] = { documents: count };
      } catch (e) {
        stats[collection.name] = { error: 'Failed to get count' };
      }
    }
    diagnostics.database.stats = stats;
  } catch (error) {
    diagnostics.database = {
      status: 'error',
      error: String(error)
    };
  }

  // Solana diagnostics
  try {
    const { healthCheck, getTreasuryBalance } = await import('@/lib/solana');
    const health = await healthCheck();
    const balance = await getTreasuryBalance();
    
    diagnostics.blockchain = {
      ...health,
      treasury: {
        balance,
        unit: 'SOL'
      }
    };
  } catch (error) {
    diagnostics.blockchain = {
      status: 'error',
      error: String(error)
    };
  }

  diagnostics.responseTime = Date.now() - startTime;

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store',
    }
  });
}
