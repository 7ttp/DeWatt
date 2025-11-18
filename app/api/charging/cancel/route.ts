import { NextRequest, NextResponse } from 'next/server';
import { connectDB, cancelSession } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { chargeId } = await req.json();

    await connectDB();
    await cancelSession(chargeId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json({ error: 'Failed to cancel session' }, { status: 500 });
  }
}
