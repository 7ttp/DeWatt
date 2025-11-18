import { NextRequest, NextResponse } from 'next/server';
import { connectDB, getP2POrders } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'buy';

    await connectDB();
    const orders = await getP2POrders(type);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
