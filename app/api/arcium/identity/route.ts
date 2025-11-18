/**
 * Private Identity API
 * Zero-knowledge identity proofs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumClient } from '@/lib/arcium/client';
import { createPrivateIdentity } from '@/lib/arcium/features/privateIdentity';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, attributeType, value, wallet, minAge, region, minSessions, minOffset } =
      body;

    const client = getArciumClient();
    const identity = createPrivateIdentity(client);

    if (action === 'add_attribute') {
      // Add encrypted attribute
      if (!attributeType || value === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      await identity.addAttribute(attributeType, value);

      return NextResponse.json({
        success: true,
        data: {
          attributeType,
          encrypted: true,
          timestamp: Date.now(),
        },
      });
    }

    if (action === 'prove_age') {
      // Prove age without revealing exact age
      if (!minAge || !wallet) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const proof = await identity.proveAgeOver(
        parseInt(minAge),
        new PublicKey(wallet)
      );

      return NextResponse.json({
        success: true,
        data: proof,
      });
    }

    if (action === 'prove_location') {
      // Prove location in region
      if (!region || !wallet) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const proof = await identity.proveLocationInRegion(
        region,
        new PublicKey(wallet)
      );

      return NextResponse.json({
        success: true,
        data: proof,
      });
    }

    if (action === 'prove_history') {
      // Prove charging history
      if (!minSessions || !wallet) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const proof = await identity.proveChargingHistory(
        parseInt(minSessions),
        new PublicKey(wallet)
      );

      return NextResponse.json({
        success: true,
        data: proof,
      });
    }

    if (action === 'prove_carbon') {
      // Prove carbon offset
      if (!minOffset || !wallet) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const proof = await identity.proveCarbonOffset(
        parseFloat(minOffset),
        new PublicKey(wallet)
      );

      return NextResponse.json({
        success: true,
        data: proof,
      });
    }

    if (action === 'create_credential') {
      // Create anonymous credential
      if (!wallet) {
        return NextResponse.json(
          { success: false, error: 'Missing wallet address' },
          { status: 400 }
        );
      }

      const credential = await identity.createAnonymousCredential(
        'verified_user',
        new PublicKey(wallet)
      );

      return NextResponse.json({
        success: true,
        data: {
          credential,
          type: 'verified_user',
          timestamp: Date.now(),
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Identity error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Identity operation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    features: [
      'Age verification without revealing exact age',
      'Location proof without revealing coordinates',
      'Charging history proof without revealing sessions',
      'Carbon offset proof without revealing exact amount',
      'Anonymous credentials',
    ],
    timestamp: Date.now(),
  });
}
