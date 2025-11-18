/**
 * Arcium Private Compute Endpoint
 * Computes rewards privately without exposing raw charging data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumMXE, EncryptedData } from '@/lib/arcium';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { encryptedData, wallet } = body;

    // Validate input
    if (!encryptedData || !wallet) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet address
    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Compute rewards privately in MXE
    const mxe = getArciumMXE();
    const rewards = await mxe.computePrivateRewards(encryptedData as EncryptedData);

    // Generate zero-knowledge proof
    const sessionData = mxe.decryptChargingData(
      encryptedData as EncryptedData,
      mxe['keyPair'].publicKey
    );

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: 'Failed to decrypt data' },
        { status: 400 }
      );
    }

    const zkProof = await mxe.generateZKProof(sessionData, rewards);

    // Verify proof on-chain
    const walletPubkey = new PublicKey(wallet);
    const verified = await mxe.verifyZKProofOnChain(zkProof, walletPubkey);

    return NextResponse.json({
      success: true,
      data: {
        rewards: {
          evTokens: rewards.evTokens,
          co2Saved: rewards.co2Saved,
          usdSpent: rewards.usdSpent
        },
        zkProof: {
          proof: zkProof.proof,
          publicInputs: zkProof.publicInputs,
          verified
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Private compute error:', error);
    return NextResponse.json(
      { success: false, error: 'Private computation failed' },
      { status: 500 }
    );
  }
}
