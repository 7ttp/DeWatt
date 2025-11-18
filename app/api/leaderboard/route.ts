import { NextResponse } from 'next/server';
import { connectDB, getLeaderboard } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const leaderboard = await getLeaderboard();

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
