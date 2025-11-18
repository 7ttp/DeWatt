/**
 * Privacy-Preserving Charging Session Booking
 * Uses Arcium MXE for encrypted data processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB, createChargingSession, updateUserBalance, getUserBalance } from '@/lib/db';
import { generateChargeId, createExplorerLink } from '@/lib/utils/charging';
import { sendMemoTransaction, isValidPublicKey } from '@/lib/solana';
import { getArciumMXE, ChargingSessionData } from '@/lib/arcium';

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(wallet: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(wallet);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(wallet, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }

    const { stationId, wallet, kwh, totalCost, location } = body;

    console.log('🔐 Private charging booking request:', { 
      stationId, 
      wallet: wallet?.slice(0, 8) + '...', 
      kwh, 
      totalCost 
    });

    // Validate required fields
    if (!stationId || !wallet || kwh === undefined || totalCost === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['stationId', 'wallet', 'kwh', 'totalCost']
      }, { status: 400 });
    }

    // Validate wallet address
    if (!isValidPublicKey(wallet)) {
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(wallet)) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { status: 429 });
    }

    // Parse and validate numeric values
    const kwhNum = parseFloat(kwh);
    const costNum = parseFloat(totalCost);

    if (!Number.isFinite(kwhNum) || !Number.isFinite(costNum)) {
      return NextResponse.json({ 
        error: 'Invalid numeric values for kwh or totalCost' 
      }, { status: 400 });
    }

    if (kwhNum <= 0 || kwhNum > 1000) {
      return NextResponse.json({ 
        error: 'kWh must be between 0 and 1000' 
      }, { status: 400 });
    }

    if (costNum <= 0 || costNum > 10000) {
      return NextResponse.json({ 
        error: 'Cost must be between 0 and 10000' 
      }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Check user balance
    const userBalance = await getUserBalance(wallet);
    
    if (userBalance.usd < costNum) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        required: costNum.toFixed(2),
        available: userBalance.usd.toFixed(2)
      }, { status: 400 });
    }
    
    // Generate unique charge ID
    const chargeId = generateChargeId();
    console.log('🆔 Generated charge ID:', chargeId);
    
    // Get station data
    let stationData: any = null;
    try {
      const stations = require('@/components/MapSectionHome/stations').default;
      stationData = stations.find((s: any) => s.id === stationId || s.code === stationId);
    } catch (error) {
      console.warn('⚠️  Could not load station data:', error);
    }

    // === ARCIUM PRIVACY LAYER ===
    
    // 1. Encrypt charging session data
    const mxe = getArciumMXE();
    const sessionData: ChargingSessionData = {
      stationId,
      kwh: kwhNum,
      cost: costNum,
      location: location || {
        lat: stationData?.location?.lat || 0,
        lng: stationData?.location?.lng || 0
      },
      timestamp: Date.now()
    };

    const encryptedData = mxe.encryptChargingData(sessionData);
    console.log('🔐 Data encrypted via Arcium MXE');

    // 2. Compute rewards privately
    const rewards = await mxe.computePrivateRewards(encryptedData);
    console.log('🧮 Private computation complete:', {
      evTokens: rewards.evTokens,
      co2Saved: rewards.co2Saved
    });

    // 3. Generate zero-knowledge proof
    const zkProof = await mxe.generateZKProof(sessionData, rewards);
    console.log('✅ ZK Proof generated:', zkProof.proof.substring(0, 20) + '...');

    // 4. Verify proof on-chain
    const { PublicKey } = require('@solana/web3.js');
    const walletPubkey = new PublicKey(wallet);
    const verified = await mxe.verifyZKProofOnChain(zkProof, walletPubkey);
    
    if (!verified) {
      return NextResponse.json({ 
        error: 'ZK proof verification failed' 
      }, { status: 400 });
    }

    console.log('✅ ZK Proof verified on Solana');

    // === END ARCIUM PRIVACY LAYER ===
    
    // Create encrypted memo for blockchain
    const encryptedMemo = mxe.createEncryptedMemo({
      type: 'private_charging_session',
      chargeId,
      zkProof: zkProof.proof,
      timestamp: new Date().toISOString()
    });
    
    const memoData = {
      type: 'private_charging_session',
      chargeId,
      encryptedMemo,
      zkProof: zkProof.proof.substring(0, 32),
      wallet: wallet.slice(0, 8) + '...' + wallet.slice(-8),
      timestamp: new Date().toISOString(),
      network: 'devnet',
      app: 'DeWatt-Private',
      version: '2.0.0'
    };
    
    // Send transaction to Solana blockchain
    let signature: string;
    try {
      signature = await sendMemoTransaction(memoData);
      console.log('🔑 Transaction signature:', signature);
    } catch (txError: any) {
      console.error('❌ Blockchain transaction failed:', txError);
      return NextResponse.json({ 
        error: 'Failed to record transaction on blockchain',
        details: txError.message
      }, { status: 500 });
    }
    
    const explorerLink = createExplorerLink(signature);
    
    // Create charging session in database with encrypted data
    try {
      await createChargingSession({
        chargeId,
        stationId,
        wallet,
        kwh: kwhNum,
        totalCost: costNum,
        status: 'active',
        explorerLink,
        signature,
        memo: JSON.stringify(memoData),
        // Store encrypted data and ZK proof
        encryptedData: JSON.stringify(encryptedData),
        zkProof: JSON.stringify(zkProof)
      });
      console.log('✅ Private charging session created');
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to create charging session',
        details: dbError.message
      }, { status: 500 });
    }

    // Update user balance using privately computed rewards
    try {
      await updateUserBalance(wallet, -costNum, rewards.evTokens);
      console.log(`💸 Balance updated: -${costNum.toFixed(2)}, +${rewards.evTokens} EvT tokens`);
    } catch (balanceError: any) {
      console.error('❌ Balance update failed:', balanceError);
      
      try {
        const { cancelSession } = await import('@/lib/db');
        await cancelSession(chargeId);
      } catch (cancelError) {
        console.error('❌ Failed to cancel session:', cancelError);
      }
      
      return NextResponse.json({ 
        error: balanceError.message || 'Failed to update balance',
        chargeId
      }, { status: 400 });
    }

    const newBalance = {
      usd: userBalance.usd - costNum,
      evToken: userBalance.evToken + rewards.evTokens
    };

    const response = { 
      success: true,
      chargeId, 
      explorerLink,
      signature,
      // Return only ZK proof, not raw data
      zkProof: {
        proof: zkProof.proof,
        publicInputs: zkProof.publicInputs,
        verified: true
      },
      // Rewards are revealed but source data remains private
      rewards: {
        tokensEarned: rewards.evTokens,
        co2Saved: rewards.co2Saved.toFixed(2)
      },
      newBalance,
      privacy: {
        encrypted: true,
        mxePublicKey: mxe.getPublicKey(),
        verifiedOnChain: true
      },
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Private booking successful in ${Date.now() - startTime}ms`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error: any) {
    console.error('❌ Private booking error:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Private booking failed',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const mxe = getArciumMXE();
    
    return NextResponse.json({
      status: 'ok',
      privacy: 'enabled',
      mxePublicKey: mxe.getPublicKey(),
      features: [
        'Encrypted charging data',
        'Private reward computation',
        'Zero-knowledge proofs',
        'On-chain verification'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Privacy service unavailable'
    }, { status: 500 });
  }
}
