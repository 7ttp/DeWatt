import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getSession } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { chargeId: string } }
) {
  try {
    await connectDB();
    const session = await getSession(params.chargeId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
  }
}
