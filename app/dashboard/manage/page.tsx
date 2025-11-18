'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { Zap, Calendar, DollarSign, Activity } from 'lucide-react';
import { ConfirmModal } from '@/components/Modal/Modal';
import { useConfirm } from '@/hooks/useModal';

export default function ManageChargesPage() {
  const { publicKey } = useWallet();
  const [sessions, setSessions] = useState<any[]>([]);
  const { confirm, showConfirm, closeConfirm } = useConfirm();

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/charging/sessions?wallet=${publicKey?.toString()}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const cancelSession = async (chargeId: string) => {
    showConfirm(
      'Cancel this charging session?',
      async () => {
        try {
          await fetch(`/api/charging/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chargeId }),
          });
          fetchSessions();
        } catch (error) {
          console.error('Failed to cancel session:', error);
        }
      },
      'danger',
      'Cancel Session'
    );
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Manage Charges</h1>
        <p className="text-sm md:text-base text-gray-400">View and manage your charging sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Activity className="text-blue-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-gray-400 truncate">Total Sessions</p>
              <p className="text-lg md:text-xl font-bold text-white">{sessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="text-green-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-gray-400 truncate">Active</p>
              <p className="text-lg md:text-xl font-bold text-white">{sessions.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="text-purple-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-gray-400 truncate">Total Spent</p>
              <p className="text-lg md:text-xl font-bold text-white truncate">${sessions.reduce((sum, s) => sum + s.totalCost, 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="text-orange-400" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-gray-400 truncate">Total kWh</p>
              <p className="text-lg md:text-xl font-bold text-white truncate">{sessions.reduce((sum, s) => sum + s.kwh, 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10">
          <h2 className="text-base md:text-lg font-semibold text-white">Charging Sessions</h2>
        </div>
        
        <div className="divide-y divide-white/10">
          {sessions.map((session) => (
            <div key={session.chargeId} className="p-3 md:p-6 hover:bg-white/5 transition-all duration-200 group">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    session.status === 'active' ? 'bg-green-500/20' :
                    session.status === 'completed' ? 'bg-blue-500/20' :
                    'bg-gray-500/20'
                  }`}>
                    <Zap className={`${
                      session.status === 'active' ? 'text-green-400' :
                      session.status === 'completed' ? 'text-blue-400' :
                      'text-gray-400'
                    }`} size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                      <p className="font-semibold text-white text-sm md:text-base truncate">{session.chargeId}</p>
                      <span className={`px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium whitespace-nowrap ${
                        session.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        session.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 flex-wrap">
                      <span className="truncate max-w-[100px] md:max-w-none">{session.stationId}</span>
                      <span className="hidden md:inline">•</span>
                      <span className="whitespace-nowrap">{session.kwh.toFixed(2)} kWh</span>
                      <span className="hidden md:inline">•</span>
                      <span className="whitespace-nowrap">${session.totalCost.toFixed(2)}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline whitespace-nowrap">{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                  <Link
                    href={`/dashboard/charging/${session.chargeId}`}
                    className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-white transition-all duration-200 hover:scale-105 text-center"
                  >
                    View
                  </Link>
                  {session.status === 'active' && (
                    <button
                      onClick={() => cancelSession(session.chargeId)}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-red-400 transition-all duration-200 hover:scale-105"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Zap className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-400 mb-2">No charging sessions yet</p>
            <p className="text-sm text-gray-500">Start charging to see your sessions here</p>
          </div>
        )}
      </div>

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
