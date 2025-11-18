'use client';

import { useState, useCallback } from 'react';

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

export function useAlert() {
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const showAlert = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string
  ) => {
    setAlert({ isOpen: true, message, type, title });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { alert, showAlert, closeAlert };
}

export function useConfirm() {
  const [confirm, setConfirm] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const showConfirm = useCallback((
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info',
    title?: string
  ) => {
    setConfirm({ isOpen: true, message, type, title, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { confirm, showConfirm, closeConfirm };
}
