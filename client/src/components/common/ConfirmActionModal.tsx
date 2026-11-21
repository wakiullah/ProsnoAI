'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  countBadge?: string;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'হ্যাঁ, এগিয়ে যান',
  cancelLabel = 'না, ফিরে যান',
  variant = 'warning',
  countBadge,
}) => {
  if (!isOpen) return null;

  const themeStyles = {
    danger: {
      iconBg: 'bg-red-100 text-red-600',
      icon: AlertCircle,
      confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
      badgeBg: 'bg-red-100 text-red-800 border-red-200',
    },
    warning: {
      iconBg: 'bg-amber-100 text-amber-600',
      icon: AlertTriangle,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    info: {
      iconBg: 'bg-blue-100 text-blue-600',
      icon: Info,
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    },
  }[variant];

  const Icon = themeStyles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl ${themeStyles.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
            >
              <Icon className="w-6 h-6 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                  title="বন্ধ করুন"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {countBadge && (
                <div className="mb-2">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${themeStyles.badgeBg}`}
                  >
                    {countBadge}
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs hover:shadow active:scale-95 cursor-pointer ${themeStyles.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
