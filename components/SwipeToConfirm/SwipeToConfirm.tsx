'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, Check } from 'lucide-react';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  text?: string;
  subText?: string;
  disabled?: boolean;
}

export default function SwipeToConfirm({
  onConfirm,
  text = 'Swipe to Continue',
  subText = 'Drag the slider to the right to confirm your booking',
  disabled = false,
}: SwipeToConfirmProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const SLIDER_WIDTH = 80; // Width of the slider button
  const THRESHOLD = 0.85; // 85% of the track needs to be covered

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onConfirm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onConfirm]);

  const getMaxPosition = () => {
    if (!containerRef.current) return 0;
    return containerRef.current.offsetWidth - SLIDER_WIDTH;
  };

  const handleStart = (clientX: number) => {
    if (disabled || isComplete) return;
    setIsDragging(true);
    startXRef.current = clientX - position;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled || isComplete) return;
    
    currentXRef.current = clientX - startXRef.current;
    const maxPosition = getMaxPosition();
    const newPosition = Math.max(0, Math.min(currentXRef.current, maxPosition));
    
    setPosition(newPosition);

    // Check if we've reached the threshold
    if (newPosition >= maxPosition * THRESHOLD) {
      setIsComplete(true);
      setIsDragging(false);
      setPosition(maxPosition);
    }
  };

  const handleEnd = () => {
    if (disabled || isComplete) return;
    setIsDragging(false);
    
    const maxPosition = getMaxPosition();
    if (position < maxPosition * THRESHOLD) {
      // Animate back to start
      setPosition(0);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, []);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, []);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const progressPercentage = (position / getMaxPosition()) * 100 || 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Swipe Container */}
      <div
        ref={containerRef}
        className={`relative h-20 rounded-full bg-gray-900 border-2 overflow-hidden transition-all duration-300 ${
          isComplete
            ? 'border-green-500'
            : isDragging
            ? 'border-green-400'
            : 'border-gray-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Progress Background */}
        <div
          className="absolute inset-0 bg-green-500/20 transition-all duration-200"
          style={{
            width: `${progressPercentage}%`,
          }}
        />

        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`text-lg md:text-xl font-bold transition-all duration-300 ${
              isComplete
                ? 'text-green-400'
                : progressPercentage > 50
                ? 'text-white opacity-0'
                : 'text-gray-400'
            }`}
          >
            {isComplete ? '✓ Confirmed!' : text}
          </span>
        </div>

        {/* Slider Button */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-16 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 ${
            isDragging ? 'scale-105' : 'scale-100'
          } ${isComplete ? 'cursor-default' : ''}`}
          style={{
            width: `${SLIDER_WIDTH}px`,
            transform: `translateX(${position}px) translateY(-50%)`,
            transition: isDragging || isComplete ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <div
            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ${
              isComplete
                ? 'bg-green-500'
                : 'bg-green-600'
            }`}
          >
            {isComplete ? (
              <Check className="text-white" size={32} strokeWidth={3} />
            ) : (
              <ChevronRight
                className="text-white"
                size={32}
                strokeWidth={3}
              />
            )}
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-sm md:text-base text-gray-400 animate-pulse">
        {subText}
      </p>
    </div>
  );
}
