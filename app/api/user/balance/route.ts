import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getUserBalance } from '@/lib/db';
import { isValidPublicKey } from '@/lib/solana';

// Cache for balance requests (in production, use Redis)
const balanceCache = new Map<string, { balance: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const wallet = req.nextUrl.searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({ 
        error: 'Wallet parameter required' 
      }, { status: 400 });
    }

    // Validate wallet address format
    if (!isValidPublicKey(wallet)) {
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    // Check cache first
    const cached = balanceCache.get(wallet);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log('💾 Returning cached balance for:', wallet.slice(0, 8));
      return NextResponse.json({
        ...cached.balance,
        cached: true,
        processingTime: Date.now() - startTime
      }, {
        headers: {
          'Cache-Control': 'public, max-age=5',
        }
      });
    }

    await connectDB();
    const result = await getUserBalance(wallet);

    const response = { 
      balance: {
        usd: Number(result.usd.toFixed(2)),
        evToken: Number(result.evToken.toFixed(2)),
      },
      isNewUser: result.isNewUser || false,
      welcomeBonusReceived: result.welcomeBonusReceived || false,
      cached: false,
      processingTime: Date.now() - startTime
    };

    // Update cache
    balanceCache.set(wallet, {
      balance: response,
      timestamp: now
    });

    // Clean old cache entries (simple cleanup)
    if (balanceCache.size > 1000) {
      const entries = Array.from(balanceCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      entries.slice(0, 500).forEach(([key]) => balanceCache.delete(key));
    }

    console.log(`✅ Balance fetched in ${Date.now() - startTime}ms`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=5',
      }
    });
  } catch (error: any) {
    console.error('❌ Balance fetch error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to fetch balance',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// POST endpoint to manually refresh balance (bypasses cache)
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json().catch(() => null);
    
    if (!body || !body.wallet) {
      return NextResponse.json({ 
        error: 'Wallet address required in request body' 
      }, { status: 400 });
    }

    const { wallet } = body;

    if (!isValidPublicKey(wallet)) {
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    // Clear cache for this wallet
    balanceCache.delete(wallet);

    await connectDB();
    const result = await getUserBalance(wallet);

    const response = { 
      balance: {
        usd: Number(result.usd.toFixed(2)),
        evToken: Number(result.evToken.toFixed(2)),
      },
      isNewUser: result.isNewUser || false,
      welcomeBonusReceived: result.welcomeBonusReceived || false,
      refreshed: true,
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Balance refreshed in ${Date.now() - startTime}ms`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error: any) {
    console.error('❌ Balance refresh error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to refresh balance',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}
