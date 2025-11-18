/**
 * TEMPORARY: Recheck Welcome Bonus Endpoint
 * Allows re-claiming welcome bonus for testing purposes
 * TODO: REMOVE THIS ENDPOINT IN PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB, updateUserBalance } from '@/lib/db';
import { isValidPublicKey } from '@/lib/solana';

// Welcome bonus configuration
const WELCOME_BONUS_USD = 100;
const WELCOME_BONUS_EVT = 55;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.wallet) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    const { wallet } = body;

    // Validate wallet address
    if (!isValidPublicKey(wallet)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const { db } = await connectDB();

    // Get user
    const user = await db.collection('users').findOne({ wallet });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Connect wallet first.' },
        { status: 404 }
      );
    }

    // TEMPORARY: Force reset welcome bonus flag
    await db.collection('users').updateOne(
      { wallet },
      {
        $set: {
          welcomeBonusReceived: false,
          updatedAt: new Date(),
        },
      }
    );

    // Grant welcome bonus
    await updateUserBalance(
      wallet,
      WELCOME_BONUS_USD,
      WELCOME_BONUS_EVT,
      true // Mark as welcome bonus received
    );

    console.log(`🎁 Welcome bonus RE-GRANTED to ${wallet.slice(0, 8)}...`);

    return NextResponse.json({
      success: true,
      message: 'Welcome bonus re-granted successfully',
      bonus: {
        usd: WELCOME_BONUS_USD,
        evToken: WELCOME_BONUS_EVT,
      },
      warning: 'This is a temporary testing endpoint',
    });
  } catch (error: any) {
    console.error('❌ Recheck bonus error:', error);
    return NextResponse.json(
      {
        error: 'Failed to recheck bonus',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { wallet: "your_wallet_address" }',
    warning: 'TEMPORARY TESTING ENDPOINT - REMOVE IN PRODUCTION',
    bonus: {
      usd: WELCOME_BONUS_USD,
      evToken: WELCOME_BONUS_EVT,
    },
  });
}
