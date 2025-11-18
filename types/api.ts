/**
 * API Response Types
 * Type definitions for all API endpoints in the DeWatt application
 */

// Common response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Health API
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    connected: boolean;
    responseTime?: number;
  };
  blockchain: {
    connected: boolean;
    network?: string;
  };
}

// User API
export interface User {
  id: string;
  wallet Address: string;
  username?: string;
  email?: string;
  createdAt: string;
  totalCharged: number;
  tokensEarned: number;
  level: number;
}

export interface UserStatsResponse extends ApiResponse {
  data: {
    chargingSessions: number;
    totalKwh: number;
    totalTokens: number;
    rank: number;
  };
}

// Charging API
export interface ChargingSession {
  id: string;
  userId: string;
  stationId: string;
  startTime: string;
  endTime?: string;
  kwhCharged: number;
  tokensEarned: number;
  status: 'active' | 'completed' | 'cancelled';
  transactionHash?: string;
}

export interface StartChargingRequest {
  stationId: string;
  walletAddress: string;
}

export interface StartChargingResponse extends ApiResponse {
  data: {
    sessionId: string;
    station: Station;
    startTime: string;
  };
}

export interface StopChargingRequest {
  sessionId: string;
  kwhCharged: number;
}

export interface StopChargingResponse extends ApiResponse {
  data: {
    session: ChargingSession;
    tokensEarned: number;
    transactionHash: string;
  };
}

// Station API
export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
  available: boolean;
  power: number; // kW
  connectorType: string[];
  pricePerKwh: number;
  rating: number;
  totalSessions: number;
}

export interface StationListResponse extends PaginatedResponse<Station[]> {}

export interface NearbyStationsRequest {
  latitude: number;
  longitude: number;
  radius?: number; // in km
  limit?: number;
}

// Leaderboard API
export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username?: string;
  totalKwh: number;
  tokensEarned: number;
  sessionsCount: number;
  level: number;
}

export interface LeaderboardResponse extends ApiResponse {
  data: {
    entries: LeaderboardEntry[];
    period: 'daily' | 'weekly' | 'monthly' | 'allTime';
    updatedAt: string;
  };
}

// P2P Market API
export interface MarketListing {
  id: string;
  sellerId: string;
  sellerWallet: string;
  tokens: number;
  pricePerToken: number; // in SOL
  totalPrice: number;
  status: 'active' | 'sold' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
}

export interface CreateListingRequest {
  tokens: number;
  pricePerToken: number;
  duration?: number; // hours
}

export interface PurchaseListingRequest {
  listingId: string;
  buyerWallet: string;
}

export interface MarketListingsResponse extends PaginatedResponse<MarketListing[]> {}

// Contact API
export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse extends ApiResponse {
  data: {
    ticketId?: string;
  };
}

// Arcium Privacy API
export interface PrivateTransaction {
  id: string;
  encryptedData: string;
  proof: string;
  timestamp: string;
}

export interface CreatePrivateTransactionRequest {
  amount: number;
  recipient: string;
  metadata?: Record<string, unknown>;
}

export interface PrivateTransactionResponse extends ApiResponse {
  data: PrivateTransaction;
}

// Error responses
export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse extends ApiResponse {
  error: string;
  validationErrors?: ValidationError[];
  statusCode: number;
}

// Webhook types
export interface WebhookPayload<T = unknown> {
  event: string;
  timestamp: string;
  data: T;
  signature: string;
}

export interface ChargingWebhook extends WebhookPayload<ChargingSession> {
  event: 'charging.started' | 'charging.stopped' | 'charging.completed';
}
