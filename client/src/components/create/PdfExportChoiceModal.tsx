'use client';

import React from 'react';
import { Printer, Download, X, Loader2, Sparkles, FileDown } from 'lucide-react';

interface PdfExportChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintSaveAsPdf: () => void;
  onDirectDownloadPdf: () => Promise<void>;
  isDownloadingDirect: boolean;
}

export const PdfExportChoiceModal: React.FC<PdfExportChoiceModalProps> = ({
  isOpen,
  onClose,
  onPrintSaveAsPdf,
  onDirectDownloadPdf,
  isDownloadingDirect,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={() => {
        if (!isDownloadingDirect) onClose();
      }}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                প্রশ্নপত্র PDF ডাউনলোড / প্রিন্ট
              </h3>
              <p className="text-[11px] text-slate-500">
                আপনার সুবিধামতো যেকোনো একটি মাধ্যম বেছে নিন
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isDownloadingDirect}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-40"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Options */}
        <div className="space-y-2.5">
          {/* Option 1: Print / Save as PDF (Recommended) */}
          <button
            type="button"
            disabled={isDownloadingDirect}
            onClick={() => {
              onClose();
              onPrintSaveAsPdf();
            }}
            className="w-full p-3.5 rounded-2xl border-2 border-emerald-600 bg-emerald-50/70 hover:bg-emerald-50 text-left transition active:scale-[0.99] disabled:opacity-50 group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Printer className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-extrabold text-emerald-950">
                    Print / Save as PDF
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold">
                    <Sparkles className="w-2.5 h-2.5" />
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  তাৎক্ষণিক ওপেন হয় (কোনো অপেক্ষা নেই)। সরাসরি প্রিন্ট করুন অথবা ব্রাউজার থেকে{' '}
                  <span className="font-bold text-slate-800">Save as PDF</span> সিলেক্ট করে সেভ করুন।
                </p>
              </div>
            </div>
          </button>

          {/* Option 2: Direct PDF Download (.pdf) */}
          <button
            type="button"
            disabled={isDownloadingDirect}
            onClick={async () => {
              await onDirectDownloadPdf();
            }}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-left transition active:scale-[0.99] disabled:opacity-70"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                {isDownloadingDirect ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-slate-900">
                    Direct PDF Download (.pdf)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  {isDownloadingDirect
                    ? 'সার্ভার থেকে .pdf ফাইল প্রস্তুত হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...'
                    : 'এক ক্লিকে সরাসরি .pdf ফাইল ডিভাইসে ডাউনলোড হবে (মোবাইল ও পারফেক্ট আরবি ফন্টের জন্য উপযোগী)।'}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
