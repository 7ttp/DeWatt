'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Zap, Trophy, DollarSign, Users, ShoppingCart, ChevronLeft, ChevronRight, Bell, X } from 'lucide-react';
import WelcomeBonusNotification from '@/components/WelcomeBonusNotification/WelcomeBonusNotification';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { publicKey } = useWallet();
  const pathname = usePathname();
  const [balance, setBalance] = useState({ usd: 0, evToken: 0 });
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
    timestamp: Date;
  }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserBalance = async (wallet: string) => {
    try {
      const res = await fetch(`/api/user/balance?wallet=${wallet}`);
      const data = await res.json();
      
      if (data.balance) {
        setBalance(data.balance);
        
        // Show welcome notification for new users
        if (data.isNewUser && !hasShownWelcome) {
          setHasShownWelcome(true);
          setTimeout(() => {
            showWelcomeNotification();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchUserBalance(publicKey.toString());
    } else {
      setBalance({ usd: 0, evToken: 0 });
      setHasShownWelcome(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const showWelcomeNotification = () => {
    const newNotif = {
      id: Date.now().toString(),
      title: 'Welcome Bonus Received!',
      message: 'You received $100 USD and 50 EvT Tokens',
      type: 'success' as const,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/manage', label: 'Manage Charges', icon: Zap },
    { href: '/dashboard/hof', label: 'Hall of Fame', icon: Trophy },
    { href: '/dashboard/earn', label: 'Earn', icon: DollarSign },
    { href: '/dashboard/p2p', label: 'P2P', icon: Users },
    { href: '/dashboard/market', label: 'Market', icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-black overflow-hidden relative">
      {/* Notification Panel */}
      {showNotifications && (
        <div className="fixed top-14 md:top-16 right-2 md:right-6 w-[calc(100vw-1rem)] md:w-96 max-h-[70vh] md:max-h-[600px] bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-2xl border border-white/10 rounded-xl md:rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 md:p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm md:text-base">Notifications</h3>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-60px)] md:max-h-[540px] scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-6 md:p-8 text-center text-gray-500">
                <Bell size={40} className="mx-auto mb-2 md:mb-3 opacity-50 md:w-12 md:h-12" />
                <p className="text-sm md:text-base">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 md:p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        notif.type === 'success' ? 'bg-green-500/20' :
                        notif.type === 'warning' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {notif.type === 'success' && (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {notif.type === 'info' && <Bell size={16} className="text-blue-400 md:w-5 md:h-5" />}
                        {notif.type === 'warning' && (
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-xs md:text-sm mb-0.5 md:mb-1">{notif.title}</h4>
                        <p className="text-gray-400 text-xs md:text-sm">{notif.message}</p>
                        <p className="text-gray-600 text-[10px] md:text-xs mt-0.5 md:mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mobile Overlay - Only show when sidebar is expanded on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'w-72' : 'w-16 lg:w-20'} 
        bg-gradient-to-b from-gray-900/80 to-black/95 backdrop-blur-xl border-r border-white/5 
        flex flex-col relative transition-all duration-300 ease-in-out
        fixed lg:relative inset-y-0 left-0 z-[46] lg:z-auto
        translate-x-0
      `}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-3 lg:p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
                {sidebarOpen ? (
                  <>
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-green-400/20 to-green-600/10 flex items-center justify-center border border-green-500/20 flex-shrink-0">
                      <Image 
                        src="/dewatt_logo_transparent.png" 
                        alt="DeWatt" 
                        width={24} 
                        height={24}
                        className="object-contain lg:w-7 lg:h-7"
                      />
                    </div>
                    <div className="overflow-hidden">
                      <h1 className="text-base lg:text-lg font-bold text-white tracking-tight">DeWatt</h1>
                      <p className="text-[9px] lg:text-[10px] text-gray-500 uppercase tracking-wider">Dashboard</p>
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-green-400/20 to-green-600/10 flex items-center justify-center border border-green-500/20 mx-auto">
                    <Image 
                      src="/dewatt_logo_transparent.png" 
                      alt="DeWatt" 
                      width={24} 
                      height={24}
                      className="object-contain lg:w-7 lg:h-7"
                    />
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
              >
                {sidebarOpen ? <ChevronLeft size={14} className="text-gray-400 lg:w-4 lg:h-4" /> : <ChevronRight size={14} className="text-gray-400 lg:w-4 lg:h-4" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 lg:p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2.5 lg:py-3 rounded-lg lg:rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-400 shadow-lg shadow-green-500/10'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className={`p-1.5 lg:p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    isActive 
                      ? 'bg-green-500/20' 
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Icon size={16} strokeWidth={2.5} className="lg:w-[18px] lg:h-[18px]" />
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="font-medium text-xs lg:text-sm flex-1">{item.label}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Connected Wallet */}
          {mounted && publicKey && sidebarOpen && (
            <div className="p-2 lg:p-3 border-t border-white/5">
              <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl rounded-lg lg:rounded-xl p-2 lg:p-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] lg:text-xs font-bold">
                      {publicKey.toString().slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] lg:text-[10px] text-gray-400 uppercase tracking-wider">Connected</p>
                    <p className="text-[10px] lg:text-xs text-white font-medium truncate">
                      {publicKey.toString().slice(0, 6)}...{publicKey.toString().slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-0">
        {/* Header */}
        <header className="h-14 md:h-16 bg-gradient-to-b from-gray-900/50 to-transparent backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 md:px-6 relative flex-shrink-0 z-[10000]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />
          
          {/* Balance Cards - Left Side */}
          <div className="flex items-center gap-1.5 md:gap-3 relative z-10">
            {mounted && (
              <>
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-lg md:rounded-xl px-1.5 md:px-4 py-1.5 md:py-2 border border-white/10 hover:border-white/20 transition-all duration-200">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 text-[9px] md:text-xs font-bold">$</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[7px] md:text-[9px] text-gray-500 uppercase tracking-wider leading-tight">USD</div>
                      <div className="text-[11px] md:text-sm font-bold text-white leading-tight">${balance.usd.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-xl rounded-lg md:rounded-xl px-1.5 md:px-4 py-1.5 md:py-2 border border-green-500/20 hover:border-green-500/30 transition-all duration-200">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-5 h-5 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center flex-shrink-0">
                      <Zap size={9} className="text-green-400 md:w-3 md:h-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[7px] md:text-[9px] text-green-400/70 uppercase tracking-wider leading-tight">EvT</div>
                      <div className="text-[11px] md:text-sm font-bold text-green-400 leading-tight">{balance.evToken}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications & Wallet - Right Side */}
          <div className="flex items-center gap-1.5 md:gap-3 relative z-10">
            {mounted && (
              <>
                {/* Notification Bell */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                >
                  <Bell size={14} className="text-gray-400 md:w-[18px] md:h-[18px]" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-[9px] md:text-xs font-bold">
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {/* Wallet Button */}
                <div className="wallet-button-custom relative z-50 flex-shrink-0" suppressHydrationWarning>
                  <WalletMultiButton />
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-black scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </main>
      </div>

      {/* Welcome Bonus Notification */}
      <WelcomeBonusNotification 
        onBonusClaimed={() => {
          if (publicKey) {
            fetchUserBalance(publicKey.toString());
          }
        }}
      />
    </div>
  );
}
