import { NextRequest, NextResponse } from 'next/server';
import { connectDB, createChargingSession, updateUserBalance, getUserBalance } from '@/lib/db';
import { generateChargeId, createExplorerLink } from '@/lib/utils/charging';
import { sendMemoTransaction, isValidPublicKey } from '@/lib/solana';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute

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
    // Parse and validate request body
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }

    const { stationId, wallet, kwh, totalCost } = body;

    console.log('⚡ New charging booking request:', { 
      stationId, 
      wallet: wallet?.slice(0, 8) + '...', 
      kwh, 
      totalCost 
    });

    // Validate required fields
    if (!stationId || !wallet || kwh === undefined || totalCost === undefined) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['stationId', 'wallet', 'kwh', 'totalCost']
      }, { status: 400 });
    }

    // Validate wallet address
    if (!isValidPublicKey(wallet)) {
      console.log('❌ Invalid wallet address');
      return NextResponse.json({ 
        error: 'Invalid wallet address format' 
      }, { status: 400 });
    }

    // Rate limiting
    if (!checkRateLimit(wallet)) {
      console.log('❌ Rate limit exceeded for wallet:', wallet.slice(0, 8));
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { status: 429 });
    }

    // Parse and validate numeric values
    const kwhNum = parseFloat(kwh);
    const costNum = parseFloat(totalCost);

    if (!Number.isFinite(kwhNum) || !Number.isFinite(costNum)) {
      console.log('❌ Invalid numeric values');
      return NextResponse.json({ 
        error: 'Invalid numeric values for kwh or totalCost' 
      }, { status: 400 });
    }

    if (kwhNum <= 0 || kwhNum > 1000) {
      console.log('❌ Invalid kWh amount:', kwhNum);
      return NextResponse.json({ 
        error: 'kWh must be between 0 and 1000' 
      }, { status: 400 });
    }

    if (costNum <= 0 || costNum > 10000) {
      console.log('❌ Invalid cost amount:', costNum);
      return NextResponse.json({ 
        error: 'Cost must be between 0 and 10000' 
      }, { status: 400 });
    }

    // Connect to database
    await connectDB();
    
    // Check user balance
    const userBalance = await getUserBalance(wallet);
    console.log('💰 User balance:', {
      usd: userBalance.usd.toFixed(2),
      evToken: userBalance.evToken
    });
    
    if (userBalance.usd < costNum) {
      console.log('❌ Insufficient balance');
      return NextResponse.json({ 
        error: 'Insufficient balance. Please add funds to continue.',
        required: costNum.toFixed(2),
        available: userBalance.usd.toFixed(2),
        shortfall: (costNum - userBalance.usd).toFixed(2)
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
    
    // Create memo data with comprehensive information
    const memoData = {
      type: 'charging_session',
      chargeId,
      station: stationId,
      stationName: stationData?.name || 'Unknown Station',
      location: stationData?.address || stationData?.location?.address || 'Unknown Location',
      city: stationData?.location?.city || 'Unknown City',
      kwh: kwhNum,
      cost: costNum,
      pricePerKwh: stationData?.meanPrice || (costNum / kwhNum),
      wallet: wallet.slice(0, 8) + '...' + wallet.slice(-8),
      timestamp: new Date().toISOString(),
      network: 'devnet',
      app: 'DeWatt',
      version: '1.0.0'
    };
    
    console.log('📝 Memo data prepared');
    
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
    console.log('🔗 Explorer link:', explorerLink);
    
    // Create charging session in database
    let session;
    try {
      session = await createChargingSession({
        chargeId,
        stationId,
        wallet,
        kwh: kwhNum,
        totalCost: costNum,
        status: 'active',
        explorerLink,
        signature,
        memo: JSON.stringify(memoData),
      });
      console.log('✅ Charging session created');
    } catch (dbError: any) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ 
        error: 'Failed to create charging session',
        details: dbError.message
      }, { status: 500 });
    }

    // Update user balance (deduct USD, add EvT tokens)
    try {
      await updateUserBalance(wallet, -costNum, kwhNum);
      console.log(`💸 Balance updated: -$${costNum.toFixed(2)}, +${kwhNum} EvT tokens`);
    } catch (balanceError: any) {
      console.error('❌ Balance update failed:', balanceError);
      
      // Try to cancel the session since balance update failed
      try {
        const { cancelSession } = await import('@/lib/db');
        await cancelSession(chargeId);
        console.log('🔄 Session cancelled due to balance update failure');
      } catch (cancelError) {
        console.error('❌ Failed to cancel session:', cancelError);
      }
      
      return NextResponse.json({ 
        error: balanceError.message || 'Failed to update balance',
        chargeId // Return chargeId so user can reference it
      }, { status: 400 });
    }

    const newBalance = {
      usd: userBalance.usd - costNum,
      evToken: userBalance.evToken + kwhNum
    };

    const response = { 
      success: true,
      chargeId, 
      explorerLink,
      signature,
      tokensEarned: kwhNum,
      co2Saved: (kwhNum * 0.85).toFixed(2), // 0.85 kg CO2 per kWh
      memo: memoData,
      newBalance,
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Booking successful in ${Date.now() - startTime}ms`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  } catch (error: any) {
    console.error('❌ Booking error:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Booking failed',
      processingTime: Date.now() - startTime
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET(req: NextRequest) {
  try {
    const { healthCheck: dbHealthCheck } = await import('@/lib/db');
    const { healthCheck: solanaHealthCheck } = await import('@/lib/solana');

    const [dbHealth, solanaHealth] = await Promise.all([
      dbHealthCheck(),
      solanaHealthCheck()
    ]);

    return NextResponse.json({
      status: 'ok',
      database: dbHealth ? 'connected' : 'disconnected',
      blockchain: solanaHealth.connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed'
    }, { status: 500 });
  }
}
