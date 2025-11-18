import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getUserBalance, updateUserBalance } from '@/lib/db';
import { createExplorerLink } from '@/lib/utils/charging';
import { sendWelcomeBonus, isValidPublicKey } from '@/lib/solana';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const rateLimitMap = new Map();
const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 3600000;

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
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }

    const { wallet } = body;

    if (!wallet) {
      return NextResponse.json({ 
        error: 'Wallet address required' 
      }, { status: 400 });
    }

    if (!isValidPublicKey(wallet)) {
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    if (!checkRateLimit(wallet)) {
      return NextResponse.json({ 
        error: 'Too many welcome bonus requests. Please try again later.',
        retryAfter: '1 hour'
      }, { status: 429 });
    }

    await connectDB();
    const userBalance = await getUserBalance(wallet);
    
    if (userBalance.welcomeBonusReceived) {
      return NextResponse.json({ 
        error: 'Welcome bonus already claimed',
        alreadyClaimed: true
      }, { status: 400 });
    }

    let signature: string;
    try {
      signature = await sendWelcomeBonus(wallet);
    } catch (txError: any) {
      return NextResponse.json({ 
        error: 'Failed to record welcome bonus on blockchain',
        details: process.env.NODE_ENV === 'development' ? txError.message : undefined
      }, { status: 500 });
    }

    const explorerLink = createExplorerLink(signature);

    try {
      await updateUserBalance(wallet, 100, 50, true);
    } catch (updateError: any) {
      return NextResponse.json({ 
        error: 'Failed to update user balance',
        details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      usdBonus: 100,
      tokenBonus: 50,
      signature,
      explorerLink,
      newBalance: {
        usd: userBalance.usd + 100,
        evToken: userBalance.evToken + 50
      },
      processingTime: Date.now() - startTime
    }, {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to grant welcome bonus',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get('wallet');
    
    if (!wallet) {
      return NextResponse.json({ 
        error: 'Wallet parameter required' 
      }, { status: 400 });
    }

    if (!isValidPublicKey(wallet)) {
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    await connectDB();
    const userBalance = await getUserBalance(wallet);

    return NextResponse.json({
      eligible: !userBalance.welcomeBonusReceived,
      alreadyClaimed: userBalance.welcomeBonusReceived,
      bonusAmount: {
        usd: 100,
        evToken: 50
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check eligibility'
    }, { status: 500 });
  }
}
