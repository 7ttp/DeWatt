/**
 * TEMPORARY: Force Welcome Bonus Endpoint
 * Grants welcome bonus without any checks
 * TODO: REMOVE THIS ENDPOINT IN PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
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

    // Get or create user
    let user = await db.collection('users').findOne({ wallet });

    if (!user) {
      // Create new user
      await db.collection('users').insertOne({
        wallet,
        usdBalance: 0,
        evTokenBalance: 0,
        totalKwh: 0,
        co2Saved: 0,
        welcomeBonusReceived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // FORCE add bonus directly to balance (no checks)
    await db.collection('users').updateOne(
      { wallet },
      {
        $inc: {
          usdBalance: WELCOME_BONUS_USD,
          evTokenBalance: WELCOME_BONUS_EVT,
        },
        $set: {
          welcomeBonusReceived: false, // Keep false so it can be claimed again
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Get updated balance
    const updatedUser = await db.collection('users').findOne({ wallet });

    console.log(
      `💰 FORCE BONUS GRANTED to ${wallet.slice(0, 8)}... | New Balance: $${updatedUser?.usdBalance} USD, ${updatedUser?.evTokenBalance} EvT`
    );

    return NextResponse.json({
      success: true,
      message: 'Bonus forcefully added to account',
      bonus: {
        usd: WELCOME_BONUS_USD,
        evToken: WELCOME_BONUS_EVT,
      },
      newBalance: {
        usd: updatedUser?.usdBalance || 0,
        evToken: updatedUser?.evTokenBalance || 0,
      },
      warning: '⚠️ TEMPORARY TESTING ENDPOINT - REMOVE IN PRODUCTION',
    });
  } catch (error: any) {
    console.error('❌ Force bonus error:', error);
    return NextResponse.json(
      {
        error: 'Failed to force bonus',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { wallet: "your_wallet_address" }',
    warning: '⚠️ TEMPORARY TESTING ENDPOINT - REMOVE IN PRODUCTION',
    description: 'This endpoint adds bonus without any checks or limits',
    bonus: {
      usd: WELCOME_BONUS_USD,
      evToken: WELCOME_BONUS_EVT,
    },
  });
}
