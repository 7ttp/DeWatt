/**
 * Arcium Integration Test Endpoint
 * Run comprehensive tests to verify Arcium implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumClient } from '@/lib/arcium/client';
import { getArciumMXE } from '@/lib/arcium';
import { createPrivateAuction } from '@/lib/arcium/features/privateAuction';
import { createPrivateIdentity } from '@/lib/arcium/features/privateIdentity';
import { createPrivateAnalytics } from '@/lib/arcium/features/privateAnalytics';
import { PublicKey } from '@solana/web3.js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('test') || 'all';

  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
  };

  try {
    // Test 1: Client Initialization
    if (testType === 'all' || testType === 'client') {
      try {
        const client = getArciumClient();
        const status = await client.getMXEStatus();
        results.tests.push({
          name: 'Client Initialization',
          passed: status.online && status.nodes > 0,
          details: {
            publicKey: client.getPublicKey().substring(0, 20) + '...',
            mxeStatus: status,
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Client Initialization',
          passed: false,
          error: error.message,
        });
      }
    }

    // Test 2: Encryption
    if (testType === 'all' || testType === 'encryption') {
      try {
        const client = getArciumClient();
        const testData = { test: 'data', value: 12345 };
        const encrypted = await client.encryptForMXE(testData);
        const decrypted = await client.decryptFromMXE(encrypted);

        results.tests.push({
          name: 'Encryption & Decryption',
          passed: JSON.stringify(testData) === JSON.stringify(decrypted),
          details: {
            encrypted: encrypted.ciphertext.substring(0, 20) + '...',
            decrypted: decrypted,
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Encryption & Decryption',
          passed: false,
          error: error.message,
        });
      }
    }

    // Test 3: ZK Proofs
    if (testType === 'all' || testType === 'zkproof') {
      try {
        const client = getArciumClient();
        const testWallet = new PublicKey('11111111111111111111111111111111');

        const proof = await client.generateZKProof(
          { secret: 'hidden' },
          { public: 'visible' },
          'test_circuit'
        );

        const verified = await client.verifyZKProofOnChain(proof, testWallet);

        results.tests.push({
          name: 'Zero-Knowledge Proofs',
          passed: verified,
          details: {
            proof: proof.proof.substring(0, 20) + '...',
            publicInputs: proof.publicInputs,
            verified,
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Zero-Knowledge Proofs',
          passed: false,
          error: error.message,
        });
      }
    }

    // Test 4: Private Charging
    if (testType === 'all' || testType === 'charging') {
      try {
        const mxe = getArciumMXE();
        const sessionData = {
          stationId: 'test_station',
          kwh: 25.5,
          cost: 12.75,
          location: { lat: 40.7128, lng: -74.0060 },
          timestamp: Date.now(),
        };

        const encrypted = mxe.encryptChargingData(sessionData);
        const rewards = await mxe.computePrivateRewards(encrypted);
        const proof = await mxe.generateZKProof(sessionData, rewards);

        results.tests.push({
          name: 'Private Charging',
          passed: rewards.evTokens === 25.5,
          details: {
            rewards,
            proof: proof.proof.substring(0, 20) + '...',
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Private Charging',
          passed: false,
          error: error.message,
        });
      }
    }

    // Test 5: Private Auction
    if (testType === 'all' || testType === 'auction') {
      try {
        const client = getArciumClient();
        const auction = createPrivateAuction(client);
        const testWallet = new PublicKey('11111111111111111111111111111111');

        const auctionId = await auction.createAuction(
          'fast_charge',
          'Test auction',
          30,
          25
        );

        const bidId = await auction.submitSealedBid(auctionId, testWallet, 40);

        results.tests.push({
          name: 'Private Auction',
          passed: true,
          details: {
            auctionId,
            bidId,
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Private Auction',
          passed: false,
          error: error.message,
        });
      }
    }

    // Test 6: Private Identity
    if (testType === 'all' || testType === 'identity') {
      try {
        const client = getArciumClient();
        const identity = createPrivateIdentity(client);
        const testWallet = new PublicKey('11111111111111111111111111111111');

        await identity.addAttribute('age', 25);
        const proof = await identity.proveAgeOver(18, testWallet);

        results.tests.push({
          name: 'Private Identity',
          passed: proof.verified,
          details: {
            claim: proof.claim,
            verified: proof.verified,
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Private Identity',
          passed: false,
          error: error.message,
        });
      }
    }

    // Test 7: Private Analytics
    if (testType === 'all' || testType === 'analytics') {
      try {
        const client = getArciumClient();
        const analytics = createPrivateAnalytics(client);

        await analytics.addDataPoint('user1', 'test_metric', 25.5);
        await analytics.addDataPoint('user2', 'test_metric', 30.2);
        const aggregate = await analytics.computeAggregate('test_metric');

        results.tests.push({
          name: 'Private Analytics',
          passed: aggregate.count === 2,
          details: {
            count: aggregate.count,
            average: aggregate.average,
            proof: aggregate.proof.substring(0, 20) + '...',
          },
        });
      } catch (error: any) {
        results.tests.push({
          name: 'Private Analytics',
          passed: false,
          error: error.message,
        });
      }
    }

    // Calculate summary
    const passed = results.tests.filter((t: any) => t.passed).length;
    const total = results.tests.length;

    results.summary = {
      total,
      passed,
      failed: total - passed,
      successRate: ((passed / total) * 100).toFixed(1) + '%',
      allPassed: passed === total,
    };

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error: any) {
    console.error('Test execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testName } = body;

    // Run specific test based on request
    return NextResponse.json({
      success: true,
      message: `Test "${testName}" execution not implemented in POST`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
