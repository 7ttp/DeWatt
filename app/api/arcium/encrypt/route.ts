/**
 * Arcium Encryption Endpoint
 * Encrypts charging session data for privacy-preserving computation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumMXE, ChargingSessionData } from '@/lib/arcium';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId, kwh, cost, location } = body;

    // Validate input
    if (!stationId || !kwh || !cost || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create charging session data
    const sessionData: ChargingSessionData = {
      stationId,
      kwh: parseFloat(kwh),
      cost: parseFloat(cost),
      location: {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      },
      timestamp: Date.now()
    };

    // Encrypt data using Arcium MXE
    const mxe = getArciumMXE();
    const encryptedData = mxe.encryptChargingData(sessionData);

    return NextResponse.json({
      success: true,
      data: {
        encrypted: encryptedData,
        mxePublicKey: mxe.getPublicKey(),
        timestamp: sessionData.timestamp
      }
    });
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json(
      { success: false, error: 'Encryption failed' },
      { status: 500 }
    );
  }
}
