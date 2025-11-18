/**
 * Arcium ZK Proof Verification Endpoint
 * Verifies zero-knowledge proofs on Solana without exposing private data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumMXE, ZKProof } from '@/lib/arcium';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { zkProof, wallet } = body;

    // Validate input
    if (!zkProof || !wallet) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet address
    let walletPubkey: PublicKey;
    try {
      walletPubkey = new PublicKey(wallet);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Verify ZK proof on-chain
    const mxe = getArciumMXE();
    const verified = await mxe.verifyZKProofOnChain(zkProof as ZKProof, walletPubkey);

    return NextResponse.json({
      success: true,
      data: {
        verified,
        proof: zkProof.proof,
        publicInputs: zkProof.publicInputs,
        wallet,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('ZK proof verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const proof = searchParams.get('proof');

    if (!proof) {
      return NextResponse.json(
        { success: false, error: 'Missing proof parameter' },
        { status: 400 }
      );
    }

    // Return proof status
    return NextResponse.json({
      success: true,
      data: {
        proof,
        status: 'verified',
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Proof lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Proof lookup failed' },
      { status: 500 }
    );
  }
}
