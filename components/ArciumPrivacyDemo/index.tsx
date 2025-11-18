/**
 * Arcium Privacy Demo Component
 * Showcases privacy-preserving features
 */

'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useArciumPrivacy } from '@/hooks/useArciumPrivacy';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function ArciumPrivacyDemo() {
  const { connected } = useWallet();
  const {
    loading,
    error,
    bookPrivateSession,
    createPrivateP2POrder,
    getPrivateLeaderboard
  } = useArciumPrivacy();

  const [activeDemo, setActiveDemo] = useState<'charging' | 'p2p' | 'leaderboard'>('charging');
  const [result, setResult] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Demo: Private Charging Session
  const demoPrivateCharging = async () => {
    setResult(null);
    const res = await bookPrivateSession(
      'station_001',
      25.5,
      12.75,
      { lat: 40.7128, lng: -74.0060 }
    );
    setResult(res);
  };

  // Demo: Private P2P Order
  const demoPrivateP2P = async () => {
    setResult(null);
    const res = await createPrivateP2POrder('sell', 100, 0.5);
    setResult(res);
  };

  // Demo: Private Leaderboard
  const demoPrivateLeaderboard = async () => {
    setResult(null);
    const res = await getPrivateLeaderboard(10);
    setResult(res);
  };

  const demos = [
    {
      id: 'charging',
      title: 'Private Charging',
      description: 'Book charging sessions with encrypted data',
      icon: Shield,
      action: demoPrivateCharging
    },
    {
      id: 'p2p',
      title: 'Private P2P Trading',
      description: 'Trade tokens with zero-knowledge proofs',
      icon: Lock,
      action: demoPrivateP2P
    },
    {
      id: 'leaderboard',
      title: 'Private Leaderboard',
      description: 'Rankings without exposing individual data',
      icon: Eye,
      action: demoPrivateLeaderboard
    }
  ];

  if (!connected) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h3 className="text-2xl font-bold mb-2">Privacy-Preserving Features</h3>
        <p className="text-gray-400 mb-4">
          Connect your wallet to explore Arcium-powered privacy features
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-2xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-400" />
          Arcium Privacy Features
        </h2>
        <p className="text-gray-400">
          Experience privacy-preserving operations powered by encrypted compute
        </p>
      </div>

      {/* Demo Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id as any)}
              className={`p-6 rounded-xl border-2 transition-all ${
                activeDemo === demo.id
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-purple-500/50'
              }`}
            >
              <Icon className="w-8 h-8 mb-3 text-purple-400" />
              <h3 className="font-bold mb-2">{demo.title}</h3>
              <p className="text-sm text-gray-400">{demo.description}</p>
            </button>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            const demo = demos.find(d => d.id === activeDemo);
            if (demo) demo.action();
          }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all"
        >
          {loading ? 'Processing...' : `Run ${demos.find(d => d.id === activeDemo)?.title}`}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-xl">
          <p className="text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Result
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {showDetails && (
            <pre className="bg-black/50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          {!showDetails && result.success && (
            <div className="space-y-2">
              {result.chargeId && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Charge ID:</span> {result.chargeId}
                </p>
              )}
              {result.orderId && (
                <p className="text-gray-300">
                  <span className="text-gray-500">Order ID:</span> {result.orderId}
                </p>
              )}
              {result.zkProof && (
                <p className="text-green-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Zero-Knowledge Proof Verified
                </p>
              )}
              {result.privacy && (
                <p className="text-purple-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Data Encrypted & Private
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Privacy Info */}
      <div className="mt-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Lock className="w-5 h-5 text-purple-400" />
          Privacy Guarantees
        </h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>✓ All sensitive data encrypted via Arcium MXE</li>
          <li>✓ Computations performed in secure enclaves</li>
          <li>✓ Zero-knowledge proofs verified on Solana</li>
          <li>✓ No raw data exposed to third parties</li>
        </ul>
      </div>
    </div>
  );
}