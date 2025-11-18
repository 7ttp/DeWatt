/**
 * React Hook for Arcium Privacy Features
 * Provides easy access to privacy-preserving operations
 */

import { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface EncryptedData {
  ciphertext: string;
  nonce: string;
  publicKey: string;
}

interface ZKProof {
  proof: string;
  publicInputs: string[];
  verified: boolean;
}

interface PrivateChargingResult {
  success: boolean;
  chargeId?: string;
  explorerLink?: string;
  signature?: string;
  zkProof?: ZKProof;
  rewards?: {
    tokensEarned: number;
    co2Saved: string;
  };
  privacy?: {
    encrypted: boolean;
    mxePublicKey: string;
    verifiedOnChain: boolean;
  };
  error?: string;
}

interface PrivateP2PResult {
  success: boolean;
  orderId?: string;
  zkProof?: ZKProof;
  error?: string;
}

export function useArciumPrivacy() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Encrypt charging session data
   */
  const encryptChargingData = useCallback(async (
    stationId: string,
    kwh: number,
    cost: number,
    location: { lat: number; lng: number }
  ): Promise<EncryptedData | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/arcium/encrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stationId, kwh, cost, location })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Encryption failed');
      }

      return data.data.encrypted;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Book private charging session
   */
  const bookPrivateSession = useCallback(async (
    stationId: string,
    kwh: number,
    totalCost: number,
    location?: { lat: number; lng: number }
  ): Promise<PrivateChargingResult> => {
    try {
      setLoading(true);
      setError(null);

      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/charging/book-private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId,
          wallet: publicKey.toString(),
          kwh,
          totalCost,
          location
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Private booking failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  /**
   * Compute rewards privately
   */
  const computePrivateRewards = useCallback(async (
    encryptedData: EncryptedData
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/arcium/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedData,
          wallet: publicKey.toString()
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Private computation failed');
      }

      return data.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  /**
   * Verify ZK proof
   */
  const verifyZKProof = useCallback(async (
    zkProof: ZKProof
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/arcium/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zkProof,
          wallet: publicKey.toString()
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      return data.data.verified;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  /**
   * Create private P2P order
   */
  const createPrivateP2POrder = useCallback(async (
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<PrivateP2PResult> => {
    try {
      setLoading(true);
      setError(null);

      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/arcium/p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          wallet: publicKey.toString(),
          type,
          amount,
          price
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Order creation failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  /**
   * Execute private P2P trade
   */
  const executePrivateTrade = useCallback(async (
    orderId: string
  ): Promise<PrivateP2PResult> => {
    try {
      setLoading(true);
      setError(null);

      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const response = await fetch('/api/arcium/p2p', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          wallet: publicKey.toString(),
          orderId
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Trade execution failed');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  /**
   * Get private leaderboard
   */
  const getPrivateLeaderboard = useCallback(async (
    limit: number = 100
  ): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      const url = publicKey 
        ? `/api/arcium/leaderboard?limit=${limit}&wallet=${publicKey.toString()}`
        : `/api/arcium/leaderboard?limit=${limit}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      return data.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  return {
    loading,
    error,
    encryptChargingData,
    bookPrivateSession,
    computePrivateRewards,
    verifyZKProof,
    createPrivateP2POrder,
    executePrivateTrade,
    getPrivateLeaderboard
  };
}
