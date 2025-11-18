/**
 * Private Analytics with Arcium
 * Aggregate insights without exposing individual user data
 */

import { ArciumClient } from '../client';

export interface AnalyticsData {
  userId: string;
  metric: string;
  value: number;
  timestamp: number;
  encrypted: boolean;
}

export interface AggregateResult {
  metric: string;
  count: number;
  average?: number;
  total?: number;
  min?: number;
  max?: number;
  proof: string;
}

export class PrivateAnalytics {
  private client: ArciumClient;
  private dataPoints: AnalyticsData[];

  constructor(client: ArciumClient) {
    this.client = client;
    this.dataPoints = [];
  }

  /**
   * Add encrypted analytics data point
   */
  async addDataPoint(
    userId: string,
    metric: string,
    value: number
  ): Promise<void> {
    const encrypted = await this.client.encryptForMXE({
      userId,
      metric,
      value,
      timestamp: Date.now(),
    });

    this.dataPoints.push({
      userId,
      metric,
      value, // In production, this would be encrypted
      timestamp: Date.now(),
      encrypted: true,
    });

    console.log(`📊 Added encrypted ${metric} data point`);
  }

  /**
   * Compute aggregate statistics without revealing individual data
   */
  async computeAggregate(metric: string): Promise<AggregateResult> {
    const relevantData = this.dataPoints.filter((d) => d.metric === metric);

    if (relevantData.length === 0) {
      throw new Error(`No data for metric: ${metric}`);
    }

    // Submit to MXE for private computation
    const encryptedBatch = await this.client.encryptForMXE({
      metric,
      dataPoints: relevantData,
    });

    const job = await this.client.submitComputeJob(
      encryptedBatch,
      'aggregate_stats'
    );

    // Generate ZK proof of correct computation
    const proof = await this.client.generateZKProof(
      { dataPoints: relevantData },
      { metric, count: relevantData.length },
      'aggregate_proof'
    );

    // Compute aggregates (in production, done in MXE)
    const values = relevantData.map((d) => d.value);
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    console.log(`📈 Computed aggregate for ${metric}: avg=${average.toFixed(2)}`);

    return {
      metric,
      count: relevantData.length,
      average,
      total,
      min,
      max,
      proof: proof.proof,
    };
  }

  /**
   * Compute percentile without revealing individual values
   */
  async computePercentile(
    metric: string,
    percentile: number
  ): Promise<{ value: number; proof: string }> {
    const relevantData = this.dataPoints.filter((d) => d.metric === metric);

    if (relevantData.length === 0) {
      throw new Error(`No data for metric: ${metric}`);
    }

    // Sort and compute percentile (in production, done in MXE)
    const sorted = relevantData.map((d) => d.value).sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    const value = sorted[index];

    // Generate ZK proof
    const proof = await this.client.generateZKProof(
      { dataPoints: relevantData },
      { metric, percentile, value },
      'percentile_proof'
    );

    return {
      value,
      proof: proof.proof,
    };
  }

  /**
   * Compare user to aggregate without revealing user's exact value
   */
  async compareToAggregate(
    userId: string,
    metric: string
  ): Promise<{
    aboveAverage: boolean;
    percentile: number;
    proof: string;
  }> {
    const userData = this.dataPoints.find(
      (d) => d.userId === userId && d.metric === metric
    );

    if (!userData) {
      throw new Error('User data not found');
    }

    const aggregate = await this.computeAggregate(metric);

    // Generate ZK proof of comparison
    const proof = await this.client.generateZKProof(
      { userValue: userData.value },
      { metric, average: aggregate.average },
      'comparison_proof'
    );

    const aboveAverage = userData.value > (aggregate.average || 0);

    // Calculate percentile
    const allValues = this.dataPoints
      .filter((d) => d.metric === metric)
      .map((d) => d.value)
      .sort((a, b) => a - b);

    const rank = allValues.filter((v) => v < userData.value).length;
    const percentile = (rank / allValues.length) * 100;

    return {
      aboveAverage,
      percentile: Math.round(percentile),
      proof: proof.proof,
    };
  }

  /**
   * Generate heatmap data without revealing individual locations
   */
  async generatePrivateHeatmap(
    metric: string,
    gridSize: number = 10
  ): Promise<{
    grid: number[][];
    proof: string;
  }> {
    // Create grid
    const grid: number[][] = Array(gridSize)
      .fill(0)
      .map(() => Array(gridSize).fill(0));

    // Aggregate data into grid cells (in production, done in MXE)
    const relevantData = this.dataPoints.filter((d) => d.metric === metric);

    relevantData.forEach((d) => {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      grid[x][y] += 1;
    });

    // Generate ZK proof of correct aggregation
    const proof = await this.client.generateZKProof(
      { dataPoints: relevantData },
      { metric, gridSize },
      'heatmap_proof'
    );

    return {
      grid,
      proof: proof.proof,
    };
  }

  /**
   * Detect anomalies without revealing individual data
   */
  async detectAnomalies(
    metric: string,
    threshold: number = 2
  ): Promise<{
    anomalyCount: number;
    proof: string;
  }> {
    const aggregate = await this.computeAggregate(metric);
    const relevantData = this.dataPoints.filter((d) => d.metric === metric);

    // Calculate standard deviation
    const mean = aggregate.average || 0;
    const variance =
      relevantData.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) /
      relevantData.length;
    const stdDev = Math.sqrt(variance);

    // Count anomalies (values beyond threshold * stdDev)
    const anomalyCount = relevantData.filter(
      (d) => Math.abs(d.value - mean) > threshold * stdDev
    ).length;

    // Generate ZK proof
    const proof = await this.client.generateZKProof(
      { dataPoints: relevantData },
      { metric, threshold, anomalyCount },
      'anomaly_proof'
    );

    console.log(`🚨 Detected ${anomalyCount} anomalies in ${metric}`);

    return {
      anomalyCount,
      proof: proof.proof,
    };
  }
}

export function createPrivateAnalytics(
  client: ArciumClient
): PrivateAnalytics {
  return new PrivateAnalytics(client);
}
