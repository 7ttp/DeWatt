'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, MapPin, DollarSign, Activity, ExternalLink, X } from 'lucide-react';
import { ConfirmModal } from '@/components/Modal/Modal';
import { useConfirm } from '@/hooks/useModal';

export default function ChargingPage() {
  const params = useParams();
  const router = useRouter();
  const chargeId = params.chargeId as string;
  const [session, setSession] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  const fetchSession = async () => {
    try {
      const res = await fetch(`/api/charging/session/${chargeId}`);
      const data = await res.json();
      setSession(data);
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  useEffect(() => {
    fetchSession();
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeId]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-green-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center animate-pulse">
                <Zap className="text-green-400" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Charging Active</h1>
                <p className="text-green-400 text-sm font-medium">Session in progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-green-400">Live</span>
            </div>
          </div>

          {/* Session ID */}
          <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-1">Session ID</p>
            <p className="text-sm font-mono text-white">{chargeId}</p>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Charging Progress</h2>
          <div className="text-right">
            <p className="text-4xl font-bold text-white">{progress}%</p>
            <p className="text-sm text-gray-400">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-black/50 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Started</span>
          <span>{progress < 100 ? 'In Progress' : 'Completed'}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MapPin className="text-blue-400" size={20} />
            </div>
            <p className="text-sm text-gray-400">Station</p>
          </div>
          <p className="text-xl font-semibold text-white">{session.stationId}</p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Zap className="text-purple-400" size={20} />
            </div>
            <p className="text-sm text-gray-400">Energy</p>
          </div>
          <p className="text-xl font-semibold text-white">{session.kwh} kWh</p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="text-green-400" size={20} />
            </div>
            <p className="text-sm text-gray-400">Total Cost</p>
          </div>
          <p className="text-xl font-semibold text-white">${session.totalCost}</p>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Activity className="text-orange-400" size={20} />
            </div>
            <p className="text-sm text-gray-400">Status</p>
          </div>
          <p className="text-xl font-semibold text-green-400">Active</p>
        </div>
      </div>

      {/* Transaction Link */}
      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-400 mb-1 font-medium">Transaction Details</p>
            <p className="text-xs text-gray-400">View on Solana Explorer</p>
          </div>
          <a
            href={session.explorerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-xl text-sm font-medium text-blue-400 transition-all duration-200 hover:scale-105"
          >
            <span>View</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/dashboard/manage"
          className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold text-center text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          View All Sessions
        </Link>
        <button
          className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-2xl font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
          onClick={() => {
            showConfirm(
              'Are you sure you want to stop charging?',
              () => router.push('/dashboard/manage'),
              'danger'
            );
          }}
        >
          <X size={20} />
          <span>Stop Charging</span>
        </button>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.isOpen}
        onClose={closeConfirm}
        onConfirm={confirm.onConfirm}
        title="Stop Charging"
        message={confirm.message}
        type={confirm.type}
        confirmText="Stop"
        cancelText="Continue Charging"
      />
    </div>
  );
}
