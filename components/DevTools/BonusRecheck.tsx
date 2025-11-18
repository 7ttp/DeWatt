/**
 * TEMPORARY: Dev Tools for Bonus Rechecking
 * TODO: REMOVE THIS COMPONENT IN PRODUCTION
 */

'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Gift, RefreshCw, DollarSign, Zap } from 'lucide-react';

export default function BonusRecheck() {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const recheckBonus = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/user/recheck-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to recheck bonus');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forceBonus = async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/user/force-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to force bonus');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-yellow-400">
            Dev Tools: Bonus Recheck
          </h3>
        </div>
        <p className="text-gray-400 text-sm">
          Connect your wallet to use bonus recheck tools
        </p>
        <p className="text-red-400 text-xs mt-2">
          ⚠️ REMOVE THIS IN PRODUCTION
        </p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-yellow-400">
          Dev Tools: Bonus Recheck
        </h3>
      </div>

      <p className="text-gray-400 text-sm mb-4">
        Testing tools to re-grant welcome bonus. Use when you need more credits
        for testing.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          onClick={recheckBonus}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Recheck Bonus
        </button>

        <button
          onClick={forceBonus}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Force Add Bonus
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
          <p className="text-green-400 font-bold mb-2">✅ {result.message}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">
                +${result.bonus?.usd} USD
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-300">
                +{result.bonus?.evToken} EvT
              </span>
            </div>
          </div>
          {result.newBalance && (
            <div className="mt-3 pt-3 border-t border-green-500/30">
              <p className="text-xs text-gray-400 mb-1">New Balance:</p>
              <p className="text-sm text-gray-300">
                ${result.newBalance.usd} USD | {result.newBalance.evToken} EvT
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
        <p className="text-red-400 text-xs font-bold">
          ⚠️ TEMPORARY TESTING FEATURE
        </p>
        <p className="text-red-400/80 text-xs mt-1">
          Remove these endpoints and component before production deployment
        </p>
      </div>
    </div>
  );
}
