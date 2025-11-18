'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { Zap, MapPin, ChevronRight, Check, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AlertModal } from '@/components/Modal/Modal';
import { useAlert } from '@/hooks/useModal';

const DashboardMap = dynamic(() => import('@/components/Dashboard/DashboardMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-green-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();

  return (
    <div className="h-full p-2 md:p-6">
      <div className="h-full bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl">
        {/* Floating Info Card */}
        <div className="absolute top-3 left-3 right-3 md:top-6 md:left-6 md:right-6 z-10 pointer-events-none">
          <div className="bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-2xl rounded-xl md:rounded-2xl p-3 md:p-5 border border-green-500/20 shadow-2xl shadow-green-500/10 pointer-events-auto max-w-2xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-green-500/30 to-green-600/20 flex items-center justify-center border border-green-500/30 flex-shrink-0">
                  <MapPin className="text-green-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base md:text-xl font-bold text-white mb-0.5 md:mb-1 truncate">Charging Stations</h2>
                  <p className="text-xs md:text-sm text-gray-400 hidden sm:block">Click any green marker to view details and book</p>
                  <p className="text-xs text-gray-400 sm:hidden">Tap markers to book</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-green-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-green-500/20 flex-shrink-0">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] md:text-xs text-green-400 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="h-full w-full">
          <DashboardMap
            onStationSelect={(station) => {
              setSelectedStation(station);
              setShowBookingModal(true);
            }}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedStation && (
        <BookingModal
          station={selectedStation}
          wallet={publicKey?.toString() || ''}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedStation(null);
          }}
        />
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

function BookingModal({ station, wallet, onClose }: any) {
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [kwh, setKwh] = useState(1);
  const [chargeId, setChargeId] = useState('');
  const [explorerLink, setExplorerLink] = useState('');
  const [memoData, setMemoData] = useState<any>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();

  const totalCost = (kwh * station.meanPrice).toFixed(2);

  const handleSwipeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleSwipeMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = document.getElementById('swipe-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const progress = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    setSwipeProgress(progress);

    if (progress >= 0.95) {
      setIsDragging(false);
      setSwipeProgress(1);
      handleBooking();
    }
  };

  const handleSwipeEnd = () => {
    if (swipeProgress < 0.95) {
      setSwipeProgress(0);
    }
    setIsDragging(false);
  };

  const handleBooking = async () => {
    setStep('confirm');
    
    setTimeout(async () => {
      try {
        const res = await fetch('/api/charging/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stationId: station.code || station.id,
            wallet,
            kwh,
            totalCost,
          }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          showAlert(data.error || 'Booking failed', 'error', 'Booking Error');
          setStep('details');
          return;
        }
        
        setChargeId(data.chargeId);
        setExplorerLink(data.explorerLink);
        setMemoData(data.memo);
        setStep('success');
      } catch (error) {
        console.error('Booking failed:', error);
        showAlert('Booking failed. Please try again.', 'error', 'Error');
        setStep('details');
      }
    }, 5000);
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-black border border-green-500/20 rounded-3xl max-w-md w-full shadow-2xl shadow-green-500/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Details Step */}
        {step === 'details' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Station Details</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Station Info */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-5 border border-white/10 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center border border-green-500/20">
                  <Zap className="text-green-400" size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">Station ID</p>
                  <p className="font-bold text-white text-lg mb-2">{station.id}</p>
                  <p className="text-sm text-gray-400 flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{station.address}</span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="text-sm font-semibold text-green-400">{station.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Plugs</p>
                  <p className="text-sm font-semibold text-white">{station.availablePlugs}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Voltage</p>
                  <p className="text-sm font-semibold text-white">{station.maxVoltage}V</p>
                </div>
              </div>
            </div>
            
            {/* kWh Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3 text-gray-300">Energy Required</label>
              <input
                type="range"
                value={kwh}
                onChange={(e) => setKwh(Number(e.target.value))}
                min="1"
                max="100"
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-gray-400 text-sm">1 kWh</span>
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{kwh}</span>
                  <span className="text-gray-400 text-sm ml-2">kWh</span>
                </div>
                <span className="text-gray-400 text-sm">100 kWh</span>
              </div>
            </div>
            
            {/* Cost */}
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl p-5 border border-white/10 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-400">Rate per kWh</span>
                <span className="font-semibold text-white">${station.meanPrice}</span>
              </div>
              <div className="h-px bg-white/10 mb-3" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Cost</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">${totalCost}</div>
                  <div className="text-xs text-gray-500">{kwh} × ${station.meanPrice}</div>
                </div>
              </div>
            </div>

            {/* Swipe to Continue */}
            <div 
              id="swipe-container"
              className="relative h-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
              onMouseDown={handleSwipeStart}
              onMouseMove={handleSwipeMove}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
              onTouchStart={handleSwipeStart}
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
            >
              {/* Progress Background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 transition-all duration-100"
                style={{ 
                  width: `${swipeProgress * 100}%`,
                  opacity: 0.3 + (swipeProgress * 0.7)
                }}
              />
              
              {/* Slider Button */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-100"
                style={{ 
                  transform: `translateX(${swipeProgress * (100 - 16)}%)`,
                  boxShadow: `0 0 ${20 + swipeProgress * 20}px rgba(34, 197, 94, ${0.3 + swipeProgress * 0.5})`
                }}
              >
                <ChevronRight className="text-white" size={24} />
              </div>
              
              {/* Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span 
                  className="text-white font-bold text-lg transition-opacity duration-200"
                  style={{ opacity: 1 - swipeProgress }}
                >
                  Swipe to Continue
                </span>
                <span 
                  className="text-white font-bold text-lg absolute transition-opacity duration-200"
                  style={{ opacity: swipeProgress }}
                >
                  Release to Confirm
                </span>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Drag the slider to the right to confirm your booking
            </p>
          </div>
        )}

        {/* Confirming Step */}
        {step === 'confirm' && (
          <div className="p-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-green-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Confirming Transaction</h3>
            <p className="text-gray-400 mb-2">Processing your booking...</p>
            <p className="text-sm text-gray-500">This will take about 5 seconds</p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500/30 to-green-600/20 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-400" size={40} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Transaction Confirmed!</h3>
              <p className="text-gray-400">Your charging session has been booked</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Charge ID</p>
                <p className="text-sm font-mono text-green-400 font-semibold">{chargeId}</p>
              </div>

              {memoData && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Transaction Memo</p>
                  <div className="space-y-1 text-xs font-mono text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span>{memoData.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Station:</span>
                      <span>{memoData.station}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Energy:</span>
                      <span>{memoData.kwh} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost:</span>
                      <span>${memoData.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Network:</span>
                      <span className="text-green-400">{memoData.network}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-2">Solana Explorer</p>
                <a
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span className="truncate">View Transaction</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-4 border border-green-500/20">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Zap size={16} />
                  <span>+{kwh} EvT Tokens earned!</span>
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
                <p className="text-sm text-blue-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Visit Manage Charges to track your session</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/dashboard/manage"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-center flex items-center justify-center gap-2"
              >
                <span>Manage Charges</span>
                <ArrowRight size={18} />
              </Link>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-white transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

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
