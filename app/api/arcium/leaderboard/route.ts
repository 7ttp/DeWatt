/**
 * Arcium Private Leaderboard Endpoint
 * Computes rankings without exposing individual CO₂ savings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPrivateLeaderboard } from '@/lib/arcium';
import { connectDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const wallet = searchParams.get('wallet');

    const { db } = await connectDB();

    // Get top users by CO2 saved
    const users = await db.collection('users')
      .find({})
      .sort({ co2Saved: -1 })
      .limit(limit)
      .toArray();

    // Compute private rankings with ZK proofs
    const privateLeaderboard = createPrivateLeaderboard();
    const rankings = await privateLeaderboard.computePrivateRankings(
      users.map((user: any) => ({
        wallet: user.wallet,
        co2Saved: user.co2Saved
      }))
    );

    // If wallet is provided, find user's rank
    let userRank = null;
    if (wallet) {
      const userRanking = rankings.find(r => r.wallet === wallet);
      if (userRanking) {
        userRank = {
          rank: userRanking.rank,
          zkProof: userRanking.zkProof,
          verified: true
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: rankings.map(ranking => ({
          rank: ranking.rank,
          wallet: ranking.wallet,
          zkProof: ranking.zkProof,
          // CO2 saved is NOT exposed - only rank and proof
        })),
        userRank,
        totalUsers: users.length,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Private leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compute private leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, claimedRank, zkProof } = body;

    // Validate input
    if (!wallet || !claimedRank || !zkProof) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user's rank proof
    const privateLeaderboard = createPrivateLeaderboard();
    const verified = await privateLeaderboard.verifyRankProof(
      wallet,
      parseInt(claimedRank),
      zkProof
    );

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        claimedRank: parseInt(claimedRank),
        verified,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Rank verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Rank verification failed' },
      { status: 500 }
    );
  }
}
