'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { AlertModal, ConfirmModal } from '@/components/Modal/Modal';
import { useAlert, useConfirm } from '@/hooks/useModal';

export default function P2PPage() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [orders, setOrders] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/p2p/orders?type=${activeTab}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const createOrder = async () => {
    if (!publicKey) {
      showAlert('Please connect your wallet first', 'warning', 'Wallet Required');
      return;
    }
    
    if (!amount || !price || Number(amount) <= 0 || Number(price) <= 0) {
      showAlert('Please enter valid amount and price', 'warning', 'Invalid Input');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/p2p/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toString(),
          type: activeTab,
          amount: Number(amount),
          price: Number(price),
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setAmount('');
        setPrice('');
        fetchOrders();
        showAlert('Order created successfully!', 'success', 'Success');
      } else {
        showAlert(`Failed to create order: ${data.error || 'Unknown error'}`, 'error', 'Error');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      showAlert('Failed to create order. Please try again.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  const executeOrder = async (orderId: string) => {
    if (!publicKey) {
      showAlert('Please connect your wallet first', 'warning', 'Wallet Required');
      return;
    }

    showConfirm(
      'Execute this order?',
      async () => {
        try {
          const res = await fetch('/api/p2p/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              buyer: publicKey.toString(),
            }),
          });
          
          if (res.ok) {
            fetchOrders();
            showAlert('Order executed successfully!', 'success', 'Success');
          } else {
            showAlert('Failed to execute order', 'error', 'Error');
          }
        } catch (error) {
          console.error('Failed to execute order:', error);
          showAlert('Failed to execute order. Please try again.', 'error', 'Error');
        }
      },
      'info',
      'Execute Order'
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">P2P Trading</h1>
        <p className="text-gray-400">Trade EvT tokens directly with other users</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Create Order Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 sticky top-6">
            <h2 className="text-xl font-bold text-white mb-6">Create Order</h2>
            
            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('buy')}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'buy'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp size={16} />
                  <span>Buy</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'sell'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingDown size={16} />
                  <span>Sell</span>
                </div>
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Amount (EvT Tokens)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  <Zap className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Price per Token (USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                </div>
              </div>

              {/* Total Display */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total</span>
                  <span className="text-xl font-bold text-white">
                    ${(Number(amount) * Number(price)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={createOrder}
                disabled={loading || !amount || !price}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200 ${
                  activeTab === 'buy'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500'
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
              >
                {loading ? 'Creating...' : `Create ${activeTab === 'buy' ? 'Buy' : 'Sell'} Order`}
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                {activeTab === 'buy' ? 'Sell' : 'Buy'} Orders
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {orders.length} order{orders.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="divide-y divide-white/10">
              {orders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-white/5 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activeTab === 'buy' 
                          ? 'bg-red-500/20 border border-red-500/30' 
                          : 'bg-green-500/20 border border-green-500/30'
                      }`}>
                        {activeTab === 'buy' ? (
                          <TrendingDown className="text-red-400" size={24} />
                        ) : (
                          <TrendingUp className="text-green-400" size={24} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white">{order.amount} EV</p>
                        <p className="text-sm text-gray-400">
                          {order.wallet ? `${order.wallet.slice(0, 6)}...${order.wallet.slice(-4)}` : 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">${order.price}</p>
                      <p className="text-xs text-gray-400">per token</p>
                    </div>

                    <button
                      onClick={() => executeOrder(order._id)}
                      className={`px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg ${
                        activeTab === 'buy'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500'
                          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500'
                      }`}
                    >
                      {activeTab === 'buy' ? 'Sell' : 'Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {orders.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'buy' ? (
                    <TrendingDown className="text-gray-600" size={32} />
                  ) : (
                    <TrendingUp className="text-gray-600" size={32} />
                  )}
                </div>
                <p className="text-gray-400 mb-2">No {activeTab === 'buy' ? 'sell' : 'buy'} orders available</p>
                <p className="text-sm text-gray-500">Be the first to create an order!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={closeConfirm}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
      />
    </div>
  );
}
