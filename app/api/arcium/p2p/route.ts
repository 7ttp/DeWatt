/**
 * Arcium Private P2P Trading Endpoint
 * Enables confidential token trading with zero-knowledge balance verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPrivateP2P } from '@/lib/arcium';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, wallet, type, amount, price, orderId } = body;

    // Validate input
    if (!action || !wallet) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const privateP2P = createPrivateP2P();

    if (action === 'create') {
      // Create encrypted trading order
      if (!type || !amount || !price) {
        return NextResponse.json(
          { success: false, error: 'Missing order parameters' },
          { status: 400 }
        );
      }

      const encryptedOrder = privateP2P.createEncryptedOrder(
        type as 'buy' | 'sell',
        parseFloat(amount),
        parseFloat(price),
        wallet
      );

      // Store encrypted order in database
      const { db } = await connectDB();
      const result = await db.collection('orders').insertOne({
        wallet,
        type,
        amount: parseFloat(amount),
        price: parseFloat(price),
        status: 'open',
        encrypted: encryptedOrder,
        createdAt: new Date()
      });

      return NextResponse.json({
        success: true,
        data: {
          orderId: result.insertedId.toString(),
          encrypted: encryptedOrder,
          type,
          amount,
          price,
          timestamp: Date.now()
        }
      });
    }

    if (action === 'execute') {
      // Execute private trade with ZK verification
      if (!orderId) {
        return NextResponse.json(
          { success: false, error: 'Missing order ID' },
          { status: 400 }
        );
      }

      const { db } = await connectDB();
      
      // Get order details
      const { ObjectId } = require('mongodb');
      const order = await db.collection('orders').findOne({
        _id: new ObjectId(orderId),
        status: 'open'
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Order not found or already completed' },
          { status: 404 }
        );
      }

      // Get buyer and seller balances
      const buyer = await db.collection('users').findOne({ wallet });
      const seller = await db.collection('users').findOne({ wallet: order.wallet });

      if (!buyer || !seller) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      // Execute private trade with ZK proof
      const tradeResult = await privateP2P.executePrivateTrade(
        buyer.usdBalance,
        seller.evTokenBalance,
        order.amount,
        order.price
      );

      if (!tradeResult.success) {
        return NextResponse.json(
          { success: false, error: 'Trade execution failed' },
          { status: 400 }
        );
      }

      // Update balances (in production, this would be done via Solana program)
      const totalCost = order.amount * order.price;
      
      await db.collection('users').updateOne(
        { wallet },
        {
          $inc: {
            evTokenBalance: order.type === 'buy' ? order.amount : -order.amount,
            usdBalance: order.type === 'buy' ? -totalCost : totalCost
          }
        }
      );

      await db.collection('users').updateOne(
        { wallet: order.wallet },
        {
          $inc: {
            evTokenBalance: order.type === 'buy' ? -order.amount : order.amount,
            usdBalance: order.type === 'buy' ? totalCost : -totalCost
          }
        }
      );

      // Mark order as completed
      await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        {
          $set: {
            status: 'completed',
            buyer: wallet,
            completedAt: new Date(),
            zkProof: tradeResult.zkProof
          }
        }
      );

      return NextResponse.json({
        success: true,
        data: {
          orderId,
          amount: order.amount,
          price: order.price,
          totalCost,
          zkProof: tradeResult.zkProof,
          timestamp: Date.now()
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Private P2P error:', error);
    return NextResponse.json(
      { success: false, error: 'Private P2P operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    const { db } = await connectDB();
    
    // Get user's encrypted orders
    const query = wallet ? { wallet, status: 'open' } : { status: 'open' };
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        orders: orders.map((order: any) => ({
          orderId: order._id.toString(),
          type: order.type,
          amount: order.amount,
          price: order.price,
          wallet: order.wallet,
          encrypted: order.encrypted,
          createdAt: order.createdAt
        })),
        count: orders.length
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
