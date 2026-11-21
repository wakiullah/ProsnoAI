'use client';

import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end print:hidden">
      {/* Subtle semi-transparent backdrop so the live A4 preview remains visible above */}
      <div
        className="fixed inset-0 bg-slate-950/25 backdrop-blur-[1px] animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-up Sheet Container */}
      <div className="relative z-10 w-full max-h-[58dvh] bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 flex flex-col animate-in slide-in-from-bottom duration-200 pb-[env(safe-area-inset-bottom)]">
        {/* Grabber Pill */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 pb-2.5 pt-1 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
