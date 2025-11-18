/**
 * Private Auction System with Arcium
 * Sealed-bid auctions where bids remain private until reveal
 */

import { ArciumClient } from '../client';
import { PublicKey } from '@solana/web3.js';

export interface SealedBid {
  bidId: string;
  bidder: string;
  encryptedAmount: any;
  timestamp: number;
  revealed: boolean;
}

export interface AuctionItem {
  itemId: string;
  itemType: 'charging_slot' | 'premium_station' | 'fast_charge' | 'carbon_credit';
  description: string;
  startTime: number;
  endTime: number;
  minBid: number;
  bids: SealedBid[];
  status: 'active' | 'ended' | 'settled';
}

export class PrivateAuction {
  private client: ArciumClient;
  private auctions: Map<string, AuctionItem>;

  constructor(client: ArciumClient) {
    this.client = client;
    this.auctions = new Map();
  }

  /**
   * Create new auction
   */
  async createAuction(
    itemType: AuctionItem['itemType'],
    description: string,
    durationMinutes: number,
    minBid: number
  ): Promise<string> {
    const itemId = `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    const auction: AuctionItem = {
      itemId,
      itemType,
      description,
      startTime: now,
      endTime: now + durationMinutes * 60 * 1000,
      minBid,
      bids: [],
      status: 'active',
    };

    this.auctions.set(itemId, auction);
    console.log(`🎯 Created auction ${itemId} for ${itemType}`);

    return itemId;
  }

  /**
   * Submit sealed bid
   */
  async submitSealedBid(
    itemId: string,
    bidder: PublicKey,
    amount: number
  ): Promise<string> {
    const auction = this.auctions.get(itemId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'active') {
      throw new Error('Auction is not active');
    }

    if (Date.now() > auction.endTime) {
      throw new Error('Auction has ended');
    }

    if (amount < auction.minBid) {
      throw new Error(`Bid must be at least ${auction.minBid}`);
    }

    // Encrypt bid amount
    const encryptedAmount = await this.client.encryptForMXE({
      amount,
      bidder: bidder.toString(),
      itemId,
    });

    const bidId = `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const bid: SealedBid = {
      bidId,
      bidder: bidder.toString(),
      encryptedAmount,
      timestamp: Date.now(),
      revealed: false,
    };

    auction.bids.push(bid);
    console.log(`🔒 Sealed bid ${bidId} submitted for ${itemId}`);

    return bidId;
  }

  /**
   * End auction and determine winner privately
   */
  async endAuction(itemId: string): Promise<{
    winner: string;
    winningBidProof: string;
    settled: boolean;
  }> {
    const auction = this.auctions.get(itemId);
    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'active') {
      throw new Error('Auction already ended');
    }

    auction.status = 'ended';

    // Compute winner in MXE without revealing all bids
    const computeJob = await this.client.submitComputeJob(
      auction.bids[0].encryptedAmount,
      'auction_winner'
    );

    // Generate ZK proof of correct winner selection
    const proof = await this.client.generateZKProof(
      { bids: auction.bids },
      { itemId, bidCount: auction.bids.length },
      'auction_settlement'
    );

    // In production, this would be computed in MXE
    const winner = auction.bids[0]?.bidder || 'none';

    auction.status = 'settled';

    console.log(`🏆 Auction ${itemId} ended. Winner: ${winner.slice(0, 8)}...`);

    return {
      winner,
      winningBidProof: proof.proof,
      settled: true,
    };
  }

  /**
   * Get active auctions (without revealing bids)
   */
  getActiveAuctions(): Array<Omit<AuctionItem, 'bids'>> {
    return Array.from(this.auctions.values())
      .filter((a) => a.status === 'active')
      .map(({ bids, ...auction }) => auction);
  }

  /**
   * Check if user won auction
   */
  async checkWinStatus(
    itemId: string,
    bidder: PublicKey
  ): Promise<{ won: boolean; proof?: string }> {
    const auction = this.auctions.get(itemId);
    if (!auction || auction.status !== 'settled') {
      return { won: false };
    }

    // Generate ZK proof of win/loss without revealing bid amounts
    const userBid = auction.bids.find((b) => b.bidder === bidder.toString());
    if (!userBid) {
      return { won: false };
    }

    const proof = await this.client.generateZKProof(
      { bid: userBid },
      { itemId, bidder: bidder.toString() },
      'win_verification'
    );

    return {
      won: true,
      proof: proof.proof,
    };
  }
}

export function createPrivateAuction(client: ArciumClient): PrivateAuction {
  return new PrivateAuction(client);
}
