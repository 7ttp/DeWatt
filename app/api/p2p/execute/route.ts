import { NextRequest, NextResponse } from 'next/server';
import { connectDB, executeP2POrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { orderId, buyer } = await req.json();

    await connectDB();
    await executeP2POrder(orderId, buyer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Order execution error:', error);
    return NextResponse.json({ error: 'Failed to execute order' }, { status: 500 });
  }
}
