/**
 * Private Auction API
 * Sealed-bid auctions for charging slots and premium features
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumClient } from '@/lib/arcium/client';
import { createPrivateAuction } from '@/lib/arcium/features/privateAuction';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, itemType, description, duration, minBid, itemId, bidder, amount } =
      body;

    const client = getArciumClient();
    const auction = createPrivateAuction(client);

    if (action === 'create') {
      // Create new auction
      if (!itemType || !description || !duration || !minBid) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const auctionId = await auction.createAuction(
        itemType,
        description,
        duration,
        minBid
      );

      return NextResponse.json({
        success: true,
        data: {
          auctionId,
          itemType,
          description,
          duration,
          minBid,
          timestamp: Date.now(),
        },
      });
    }

    if (action === 'bid') {
      // Submit sealed bid
      if (!itemId || !bidder || !amount) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      try {
        new PublicKey(bidder);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid wallet address' },
          { status: 400 }
        );
      }

      const bidId = await auction.submitSealedBid(
        itemId,
        new PublicKey(bidder),
        parseFloat(amount)
      );

      return NextResponse.json({
        success: true,
        data: {
          bidId,
          itemId,
          message: 'Sealed bid submitted successfully',
          timestamp: Date.now(),
        },
      });
    }

    if (action === 'end') {
      // End auction and determine winner
      if (!itemId) {
        return NextResponse.json(
          { success: false, error: 'Missing item ID' },
          { status: 400 }
        );
      }

      const result = await auction.endAuction(itemId);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'check_win') {
      // Check if user won
      if (!itemId || !bidder) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const result = await auction.checkWinStatus(
        itemId,
        new PublicKey(bidder)
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Auction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auction operation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = getArciumClient();
    const auction = createPrivateAuction(client);

    const activeAuctions = auction.getActiveAuctions();

    return NextResponse.json({
      success: true,
      data: {
        auctions: activeAuctions,
        count: activeAuctions.length,
      },
    });
  } catch (error: any) {
    console.error('Get auctions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}
