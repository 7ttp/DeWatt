'use client';

import { useEffect, useState } from 'react';
import { Trophy, Leaf, Zap } from 'lucide-react';

export default function HallOfFamePage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      
      // Add mock data if empty
      const leaderboardData = data.leaderboard && data.leaderboard.length > 0 
        ? data.leaderboard 
        : generateMockLeaderboard();
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard(generateMockLeaderboard());
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateMockLeaderboard = () => [
    { wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', totalKwh: 1250, co2Saved: 1062.5 },
    { wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', totalKwh: 980, co2Saved: 833.0 },
    { wallet: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK', totalKwh: 875, co2Saved: 743.75 },
    { wallet: '3vZ9JhkKXPKZHqQWhzJnetJGCHqnXSP7FxqJXpRKCwYv', totalKwh: 720, co2Saved: 612.0 },
    { wallet: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH', totalKwh: 650, co2Saved: 552.5 },
    { wallet: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', totalKwh: 580, co2Saved: 493.0 },
    { wallet: 'CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq', totalKwh: 490, co2Saved: 416.5 },
    { wallet: 'GjwcWFQYzemBtpUoN5fMAP2FZviTtMRWCmrppGuTthJS', totalKwh: 420, co2Saved: 357.0 },
    { wallet: '36HA4a8wK6UZYq8nBrCsRhkCLYRJKpXzKUJWq5Kbq3Ks', totalKwh: 350, co2Saved: 297.5 },
    { wallet: 'J1S9H3QjnRtBNPp2xLR7tmgL4DQjMYW8LdqsmT8Lp2Qe', totalKwh: 280, co2Saved: 238.0 },
  ];

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-500/30 to-yellow-600/20 border-yellow-500/30';
    if (index === 1) return 'from-gray-400/30 to-gray-500/20 border-gray-400/30';
    if (index === 2) return 'from-orange-500/30 to-orange-600/20 border-orange-500/30';
    return 'from-white/10 to-white/5 border-white/10';
  };

  const getRankTextColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-orange-400';
    return 'text-white';
  };

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="text-yellow-400" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-white">Hall of Fame</h1>
            <p className="text-xs md:text-sm text-gray-400 truncate">Top contributors to CO2 reduction</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-500/30">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-green-500/30 flex items-center justify-center flex-shrink-0">
              <Leaf className="text-green-400" size={16} />
            </div>
            <p className="text-xs md:text-sm text-green-400 font-medium">Total CO2 Saved</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">
            {leaderboard.reduce((sum, user) => sum + user.co2Saved, 0).toFixed(1)} kg
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-500/30">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Zap className="text-blue-400" size={16} />
            </div>
            <p className="text-xs md:text-sm text-blue-400 font-medium">Total Energy</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">
            {leaderboard.reduce((sum, user) => sum + user.totalKwh, 0)} kWh
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-500/30">
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Trophy className="text-purple-400" size={16} />
            </div>
            <p className="text-xs md:text-sm text-purple-400 font-medium">Contributors</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{leaderboard.length}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10">
          <h2 className="text-base md:text-lg font-semibold text-white">Top Contributors</h2>
        </div>

        <div className="divide-y divide-white/10">
          {leaderboard.map((user, index) => (
            <div key={user.wallet} className="p-3 md:p-6 hover:bg-white/5 transition-all duration-200 group">
              <div className="flex items-center gap-2 md:gap-4">
                {/* Rank Badge */}
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${getRankColor(index)} border flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  {index < 3 ? (
                    <Trophy className={getRankTextColor(index)} size={20} />
                  ) : (
                    <span className={`text-lg md:text-xl font-bold ${getRankTextColor(index)}`}>
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs md:text-sm font-bold text-purple-400">
                          {user.wallet.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <p className="font-semibold text-white text-sm md:text-lg truncate">
                        {user.wallet.slice(0, 4)}...{user.wallet.slice(-3)}
                      </p>
                    </div>
                    {index === 0 && (
                      <span className="px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 whitespace-nowrap flex-shrink-0">
                        Champion
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs md:text-sm text-gray-400">
                    <Zap size={12} className="md:w-3.5 md:h-3.5 flex-shrink-0" />
                    <span className="truncate">{user.totalKwh.toFixed(2)} kWh</span>
                  </div>
                </div>

                {/* CO2 Saved */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 md:gap-2 justify-end mb-0.5 md:mb-1">
                    <Leaf className="text-green-400" size={14} />
                    <p className="text-xl md:text-3xl font-bold text-green-400">{user.co2Saved.toFixed(2)}</p>
                  </div>
                  <p className="text-[10px] md:text-sm text-gray-400 whitespace-nowrap">kg CO2</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-400 mb-2">No data available yet</p>
            <p className="text-sm text-gray-500">Start charging to appear on the leaderboard</p>
          </div>
        )}
      </div>
    </div>
  );
}
