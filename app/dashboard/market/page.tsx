'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Package, Zap, Palette, Wrench, TrendingUp, Check } from 'lucide-react';
import { AlertModal } from '@/components/Modal/Modal';
import { useAlert } from '@/hooks/useModal';

const marketItems = [
  {
    id: 'energy-kit',
    name: 'Energy Efficiency Kit',
    description: 'Includes tools and tips to reduce energy consumption.',
    cost: 300,
    icon: Package,
    color: 'from-green-500 to-green-600',
    benefits: [
      '10% energy savings for 30 days',
      'Eco-friendly badge',
      'Detailed energy reports',
      'Optimization recommendations'
    ]
  },
  {
    id: 'charging-voucher',
    name: 'Charging Time Voucher',
    description: 'Grants extra charging time at stations.',
    cost: 200,
    icon: Zap,
    color: 'from-yellow-500 to-orange-600',
    benefits: [
      '5 hours of priority charging',
      'Transferable to other users',
      'Skip the queue',
      'Valid for 60 days'
    ]
  },
  {
    id: 'nft-collection',
    name: 'Eco-Friendly NFT Collection',
    description: 'Unique digital art tied to sustainability goals.',
    cost: 500,
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    benefits: [
      'Exclusive access to virtual eco-events',
      'Passive EvT rewards',
      'Limited edition artwork',
      'Community recognition'
    ]
  },
  {
    id: 'maintenance-pass',
    name: 'Maintenance Pass',
    description: 'Covers regular upkeep for charging equipment.',
    cost: 400,
    icon: Wrench,
    color: 'from-blue-500 to-cyan-600',
    benefits: [
      'Free maintenance for 3 months',
      '15% discount on repairs',
      'Priority support',
      '24/7 assistance'
    ]
  },
  {
    id: 'boost-token',
    name: 'Community Boost Token',
    description: 'Enhances visibility in community trades.',
    cost: 150,
    icon: TrendingUp,
    color: 'from-red-500 to-orange-600',
    benefits: [
      '20% boost in trade offers for 7 days',
      'Social recognition badge',
      'Featured in marketplace',
      'Increased visibility'
    ]
  }
];

export default function MarketPage() {
  const { publicKey } = useWallet();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [purchasing, setPurchasing] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();

  const handlePurchase = async (item: any) => {
    if (!publicKey) {
      showAlert('Please connect your wallet first', 'warning', 'Wallet Required');
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch('/api/market/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          wallet: publicKey.toString(),
          cost: item.cost,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert(`Successfully purchased ${item.name}!`, 'success', 'Purchase Complete');
        setSelectedItem(null);
      } else {
        showAlert(data.error || 'Purchase failed', 'error', 'Purchase Failed');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      showAlert('Purchase failed. Please try again.', 'error', 'Error');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
        <p className="text-gray-400">Purchase virtual items to enhance your charging experience</p>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
              onClick={() => setSelectedItem(item)}
            >
              {/* Header with Icon */}
              <div className={`bg-gradient-to-br ${item.color} p-6 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm font-medium">Cost</p>
                    <p className="text-white text-2xl font-bold">{item.cost}</p>
                    <p className="text-white/80 text-xs">EvT</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                {/* Benefits */}
                <div className="space-y-2 mb-4">
                  {item.benefits.slice(0, 2).map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </div>
                  ))}
                  {item.benefits.length > 2 && (
                    <p className="text-xs text-gray-500 ml-6">+{item.benefits.length - 2} more benefits</p>
                  )}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem(item);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-2xl border border-white/10 rounded-3xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`bg-gradient-to-br ${selectedItem.color} p-6 relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                    <selectedItem.icon className="text-white" size={32} />
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.name}</h2>
                <p className="text-white/80 text-sm">{selectedItem.description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* All Benefits */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Benefits</h3>
                <div className="space-y-2">
                  {selectedItem.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="text-green-400" size={12} />
                      </div>
                      <span className="text-sm text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Cost</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{selectedItem.cost}</p>
                    <p className="text-sm text-gray-400">EvT Tokens</p>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => handlePurchase(selectedItem)}
                disabled={purchasing}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
              >
                {purchasing ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
}
