'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function EarnPage() {
  const { publicKey } = useWallet();
  const [staking, setStaking] = useState({ amount: 0, apy: 12.5 });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-8 text-white">Earn EvT Tokens</h1>

      <div className="grid gap-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white border border-green-500/30">
          <h2 className="text-2xl font-semibold mb-2">Stake & Earn</h2>
          <p className="text-green-100 mb-6">Stake your EvT tokens and earn passive income</p>
          <div className="bg-black/30 backdrop-blur rounded-lg p-6 border border-green-500/20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-green-100">Current APY</span>
              <span className="text-3xl font-bold">{staking.apy}%</span>
            </div>
            <button className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50">
              Start Staking
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Referral Program</h2>
          <p className="text-gray-400 mb-6">Earn 10 EvT tokens for each friend you refer</p>
          <div className="bg-black rounded-lg p-4 mb-4 border border-gray-800">
            <p className="text-sm text-gray-400 mb-2">Your Referral Code</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={publicKey?.toString().slice(0, 8).toUpperCase() || ''}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Charging Rewards</h2>
          <p className="text-gray-400 mb-6">Earn 1 EvT token per kWh charged</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">55</p>
              <p className="text-sm text-gray-400">Tokens Earned</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">55</p>
              <p className="text-sm text-gray-400">kWh Charged</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">1:1</p>
              <p className="text-sm text-gray-400">Reward Ratio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
