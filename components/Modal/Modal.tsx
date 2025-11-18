'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl md:rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            {title && <h3 className="text-lg md:text-xl font-semibold text-gray-900">{title}</h3>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
  const colors = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-red-600',
    warning: 'from-yellow-500 to-orange-600',
    info: 'from-blue-500 to-blue-600',
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="text-center">
        <div className="text-4xl md:text-5xl mb-3 md:mb-4">{icons[type]}</div>
        {title && <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1.5 md:mb-2">{title}</h3>}
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`w-full px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r ${colors[type]} text-white rounded-lg md:rounded-xl font-semibold hover:scale-[1.02] transition-transform text-sm md:text-base`}
        >
          OK
        </button>
      </div>
    </Modal>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}: ConfirmModalProps) {
  const colors = {
    danger: 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500',
    warning: 'from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500',
    info: 'from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500',
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div>
        <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">{message}</p>
        <div className="flex gap-2 md:gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg md:rounded-xl font-semibold transition-colors text-sm md:text-base"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r ${colors[type]} text-white rounded-lg md:rounded-xl font-semibold transition-all text-sm md:text-base`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
