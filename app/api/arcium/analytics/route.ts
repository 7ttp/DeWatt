/**
 * Private Analytics API
 * Aggregate insights without exposing individual data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getArciumClient } from '@/lib/arcium/client';
import { createPrivateAnalytics } from '@/lib/arcium/features/privateAnalytics';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, metric, value, percentile, threshold, gridSize } = body;

    const client = getArciumClient();
    const analytics = createPrivateAnalytics(client);

    if (action === 'add_data') {
      // Add encrypted data point
      if (!userId || !metric || value === undefined) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      await analytics.addDataPoint(userId, metric, parseFloat(value));

      return NextResponse.json({
        success: true,
        data: {
          userId,
          metric,
          encrypted: true,
          timestamp: Date.now(),
        },
      });
    }

    if (action === 'aggregate') {
      // Compute aggregate statistics
      if (!metric) {
        return NextResponse.json(
          { success: false, error: 'Missing metric' },
          { status: 400 }
        );
      }

      const result = await analytics.computeAggregate(metric);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'percentile') {
      // Compute percentile
      if (!metric || !percentile) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const result = await analytics.computePercentile(
        metric,
        parseFloat(percentile)
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'compare') {
      // Compare user to aggregate
      if (!userId || !metric) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const result = await analytics.compareToAggregate(userId, metric);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'heatmap') {
      // Generate private heatmap
      if (!metric) {
        return NextResponse.json(
          { success: false, error: 'Missing metric' },
          { status: 400 }
        );
      }

      const result = await analytics.generatePrivateHeatmap(
        metric,
        gridSize ? parseInt(gridSize) : 10
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    if (action === 'anomalies') {
      // Detect anomalies
      if (!metric) {
        return NextResponse.json(
          { success: false, error: 'Missing metric' },
          { status: 400 }
        );
      }

      const result = await analytics.detectAnomalies(
        metric,
        threshold ? parseFloat(threshold) : 2
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
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Analytics operation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    features: [
      'Aggregate statistics without revealing individual data',
      'Percentile computation with privacy',
      'User comparison without data exposure',
      'Private heatmap generation',
      'Anomaly detection with ZK proofs',
    ],
    timestamp: Date.now(),
  });
}
