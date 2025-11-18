import { NextRequest, NextResponse } from 'next/server';
import { connectDB, createP2POrder } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { wallet, type, amount, price } = await req.json();

    // Validation
    if (!wallet || !type || !amount || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount <= 0 || price <= 0) {
      return NextResponse.json({ error: 'Amount and price must be positive' }, { status: 400 });
    }

    if (type !== 'buy' && type !== 'sell') {
      return NextResponse.json({ error: 'Invalid order type' }, { status: 400 });
    }

    await connectDB();
    const order = await createP2POrder({ 
      wallet, 
      type, 
      amount: Number(amount), 
      price: Number(price), 
      status: 'open' 
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
