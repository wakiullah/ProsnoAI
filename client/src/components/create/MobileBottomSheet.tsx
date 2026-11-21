'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const currentOffsetRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setDragOffsetY(0);
      setIsDragging(false);
      startYRef.current = null;
      currentOffsetRef.current = 0;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (startYRef.current === null) return;
      const deltaY = Math.max(0, e.clientY - startYRef.current);
      currentOffsetRef.current = deltaY;
      setDragOffsetY(deltaY);
    };

    const handlePointerUp = () => {
      const finalOffset = currentOffsetRef.current;
      setIsDragging(false);
      startYRef.current = null;
      currentOffsetRef.current = 0;

      if (finalOffset > 60) {
        setDragOffsetY(0);
        onClose();
      } else {
        setDragOffsetY(0);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, onClose]);

  if (!isOpen) return null;

  const handleDragStart = (e: React.PointerEvent) => {
    startYRef.current = e.clientY;
    currentOffsetRef.current = 0;
    setIsDragging(true);
  };

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end print:hidden">
      {/* Subtle semi-transparent backdrop so the live A4 preview remains visible above */}
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-[1px] animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-up Sheet Container with real-time swipe-down translation */}
      <div
        style={{
          transform: dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        className="relative z-10 w-full max-h-[60dvh] bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]"
      >
        {/* Interactive Drag-to-Dismiss Handle Zone (Grabber Pill + Header) */}
        <div
          onPointerDown={handleDragStart}
          style={{ touchAction: 'none' }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          {/* Grabber Pill */}
          <div className="flex justify-center pt-2.5 pb-1.5">
            <div
              className={`w-11 h-1.5 rounded-full transition-colors ${
                isDragging ? 'bg-emerald-500' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            />
          </div>

          {/* Sheet Header */}
          <div className="px-4 pb-2.5 pt-0.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition"
              aria-label="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
