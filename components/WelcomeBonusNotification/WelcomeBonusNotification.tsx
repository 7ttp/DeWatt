'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Gift, ExternalLink, X } from 'lucide-react';

interface WelcomeBonusNotificationProps {
  onBonusClaimed?: () => void;
}

export default function WelcomeBonusNotification({ onBonusClaimed }: WelcomeBonusNotificationProps) {
  const { publicKey } = useWallet();
  const [showNotification, setShowNotification] = useState(false);
  const [bonusData, setBonusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAndClaimWelcomeBonus = async () => {
    if (!publicKey || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/user/welcome-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setBonusData(data);
        setShowNotification(true);
        
        // Trigger balance refresh
        if (onBonusClaimed) {
          onBonusClaimed();
        }
        
        // Auto-hide after 15 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 15000);
      }
    } catch (error) {
      console.error('Welcome bonus check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey && !loading) {
      checkAndClaimWelcomeBonus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  if (!showNotification || !bonusData) return null;

  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[200] max-w-[calc(100vw-2rem)] md:max-w-md animate-slide-in">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl md:rounded-2xl shadow-2xl border border-green-400/30 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-6 pb-3 md:pb-4">
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Gift className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white">Welcome Bonus!</h3>
                <p className="text-xs md:text-sm text-white/80">Your account has been credited</p>
              </div>
            </div>
            <button
              onClick={() => setShowNotification(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Bonus Details */}
          <div className="space-y-2 md:space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4">
              <div className="flex items-center justify-between mb-1.5 md:mb-2">
                <span className="text-white/80 text-xs md:text-sm">USD Balance</span>
                <span className="text-xl md:text-2xl font-bold text-white">+${bonusData.usdBonus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-xs md:text-sm">EvT Tokens</span>
                <span className="text-xl md:text-2xl font-bold text-white">+{bonusData.tokenBonus}</span>
              </div>
            </div>

            {/* Explorer Link */}
            <a
              href={bonusData.explorerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 md:px-4 py-2.5 md:py-3 bg-white hover:bg-white/90 rounded-lg md:rounded-xl font-semibold text-sm md:text-base text-green-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              <span className="hidden sm:inline">View on Solana Explorer</span>
              <span className="sm:hidden">View on Explorer</span>
              <ExternalLink size={14} className="md:w-4 md:h-4" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-2.5 md:py-3 bg-black/20 border-t border-white/10">
          <p className="text-[10px] md:text-xs text-white/70 text-center">
            🎉 Start charging and earning more EvT tokens!
          </p>
        </div>
      </div>
    </div>
  );
}
