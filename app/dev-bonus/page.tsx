/**
 * TEMPORARY: Dev Bonus Page
 * Visit this page to automatically get bonus credits
 * TODO: REMOVE THIS PAGE IN PRODUCTION
 */

'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { Gift, CheckCircle, AlertCircle, Loader2, Home } from 'lucide-react';

export default function DevBonusPage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState<{ usd: number; evToken: number } | null>(null);

  useEffect(() => {
    if (connected && publicKey && status === 'idle') {
      addBonus();
    }
  }, [connected, publicKey]);

  const addBonus = async () => {
    if (!publicKey) return;

    setStatus('loading');
    setMessage('Adding bonus credits...');

    try {
      const response = await fetch('/api/user/force-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add bonus');
      }

      setStatus('success');
      setMessage('Bonus credits added successfully!');
      setBalance(data.newBalance);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to add bonus');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Warning Banner */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm font-bold text-center">
            ⚠️ DEVELOPMENT ONLY - REMOVE IN PRODUCTION
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-full">
              <Gift className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Dev Bonus Credits
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Instant credits for testing
          </p>

          {/* Status Display */}
          <div className="mb-6">
            {!connected && (
              <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-yellow-400 font-bold mb-2">
                  Wallet Not Connected
                </p>
                <p className="text-gray-400 text-sm">
                  Please connect your wallet to receive bonus credits
                </p>
              </div>
            )}

            {connected && status === 'loading' && (
              <div className="bg-blue-900/20 border border-blue-500/50 rounded-xl p-6 text-center">
                <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-3 animate-spin" />
                <p className="text-blue-400 font-bold mb-2">Processing...</p>
                <p className="text-gray-400 text-sm">{message}</p>
              </div>
            )}

            {connected && status === 'success' && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-bold text-center mb-4">
                  {message}
                </p>

                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-2 text-center">
                    Bonus Added:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        +$100
                      </p>
                      <p className="text-xs text-gray-500">USD</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-400">
                        +55
                      </p>
                      <p className="text-xs text-gray-500">EvT Tokens</p>
                    </div>
                  </div>
                </div>

                {balance && (
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2 text-center">
                      New Balance:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">
                          ${balance.usd}
                        </p>
                        <p className="text-xs text-gray-500">USD</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">
                          {balance.evToken}
                        </p>
                        <p className="text-xs text-gray-500">EvT Tokens</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => router.push('/')}
                  className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Go to Dashboard
                </button>
              </div>
            )}

            {connected && status === 'error' && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 font-bold mb-2">Error</p>
                <p className="text-gray-400 text-sm mb-4">{message}</p>
                <button
                  onClick={addBonus}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
            <p className="text-gray-400 text-xs text-center mb-2">
              💡 Bookmark this link for quick credits
            </p>
            <p className="text-gray-500 text-xs text-center">
              Visit anytime to add $100 USD + 55 EvT tokens
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {connected && status === 'success' && (
          <div className="mt-6 text-center">
            <button
              onClick={addBonus}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-all"
            >
              Add More Credits
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
