import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getUserBalance, updateUserBalance } from '@/lib/db';
import { isValidPublicKey } from '@/lib/solana';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(wallet: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(wallet);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(wallet, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }

    const { itemId, wallet, cost } = body;

    console.log('🛒 New market purchase request:', { 
      itemId, 
      wallet: wallet?.slice(0, 8) + '...', 
      cost 
    });

    // Validate required fields
    if (!itemId || !wallet || cost === undefined) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['itemId', 'wallet', 'cost']
      }, { status: 400 });
    }

    // Validate wallet address
    if (!isValidPublicKey(wallet)) {
      console.log('❌ Invalid wallet address');
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(wallet)) {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { status: 429 });
    }

    // Validate cost
    const costNum = parseFloat(cost);
    if (!Number.isFinite(costNum) || costNum <= 0 || costNum > 1000000) {
      console.log('❌ Invalid cost value:', cost);
      return NextResponse.json({ 
        error: 'Invalid cost value. Must be between 0 and 1,000,000' 
      }, { status: 400 });
    }

    // Validate itemId format
    if (typeof itemId !== 'string' || itemId.length === 0 || itemId.length > 100) {
      console.log('❌ Invalid itemId');
      return NextResponse.json({ 
        error: 'Invalid item ID format' 
      }, { status: 400 });
    }

    await connectDB();

    // Check user balance
    const userBalance = await getUserBalance(wallet);
    console.log('💰 User balance:', {
      evToken: userBalance.evToken,
      required: costNum
    });
    
    if (userBalance.evToken < costNum) {
      console.log('❌ Insufficient EvT tokens');
      return NextResponse.json({
        error: 'Insufficient EvT tokens',
        required: costNum,
        available: userBalance.evToken,
        shortfall: costNum - userBalance.evToken
      }, { status: 400 });
    }

    // Deduct tokens from user balance
    try {
      await updateUserBalance(wallet, 0, -costNum);
      console.log('💸 Tokens deducted:', costNum, 'EvT');
    } catch (updateError: any) {
      console.error('❌ Balance update failed:', updateError);
      return NextResponse.json({
        error: updateError.message || 'Failed to update balance'
      }, { status: 500 });
    }

    // In production, you would also:
    // - Add item to user's inventory collection
    // - Create purchase record with timestamp
    // - Generate NFT if applicable
    // - Send confirmation email/notification
    // - Update item availability if limited quantity

    const newBalance = userBalance.evToken - costNum;

    const response = {
      success: true,
      itemId,
      cost: costNum,
      newBalance,
      purchaseId: `PUR-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase(),
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Purchase successful in ${Date.now() - startTime}ms`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error: any) {
    console.error('❌ Purchase error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Purchase failed',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// GET endpoint to fetch available items (optional)
export async function GET(req: NextRequest) {
  try {
    // This could fetch available marketplace items
    // For now, return a simple status
    return NextResponse.json({
      status: 'ok',
      endpoint: 'market/purchase',
      methods: ['POST'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch marketplace data'
    }, { status: 500 });
  }
}
