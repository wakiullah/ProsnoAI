'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Home,
  X,
  Undo2,
  Redo2,
  Download,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  Database,
  Key,
  FileText,
  Share,
} from 'lucide-react';
import { InstitutionHeaderConfig } from 'proshno-shared';

interface MobileTopBarProps {
  headerConfig: InstitutionHeaderConfig;
  totalMarks: number;
  questionCount: number;
  undoCount: number;
  redoCount: number;
  hasApiKey: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenSetupWizard: () => void;
  onOpenKeyModal: () => void;
  onDownloadPdf: () => void;
  onLoadArabicPdfPreset?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  headerConfig,
  totalMarks,
  questionCount,
  undoCount,
  redoCount,
  hasApiKey,
  onUndo,
  onRedo,
  onOpenSetupWizard,
  onOpenKeyModal,
  onDownloadPdf,
  onLoadArabicPdfPreset,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isArabicPaper =
    (headerConfig.subject || '').includes('আরবি') ||
    (headerConfig.subject || '').includes('العربية') ||
    (headerConfig.subjectCode || '') === '১৩৩' ||
    (headerConfig.subjectCode || '') === '১৩৪';

  return (
    <>
      {/* Canva-Style Minimal Gradient Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 h-12 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 text-white px-2.5 flex items-center justify-between shadow-sm select-none print:hidden">
        {/* Left: Sidemenu Burger + Undo + Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 active:scale-95 transition"
            aria-label="মেনু খুলুন"
            title="সাইড মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onUndo}
            disabled={undoCount === 0}
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 disabled:opacity-35 disabled:pointer-events-none active:scale-95 transition"
            aria-label="পূর্বাবস্থায় ফেরান"
            title="Undo"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onRedo}
            disabled={redoCount === 0}
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 disabled:opacity-35 disabled:pointer-events-none active:scale-95 transition"
            aria-label="পুনরায় করুন"
            title="Redo"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        {/* Right: More (...) + Download + Setup Wizard / Export */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 active:scale-95 transition"
            aria-label="আরও অপশন"
            title="পেপার তথ্য ও মেনু"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 active:scale-95 transition"
            aria-label="PDF ডাউনলোড"
            title="PDF ডাউনলোড করুন"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onOpenSetupWizard}
            className="p-2 rounded-xl hover:bg-white/15 active:bg-white/25 active:scale-95 transition"
            aria-label="নতুন প্রশ্নপত্র উইজার্ড"
            title="নতুন প্রশ্নপত্র উইজার্ড"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-over Quick Info & Navigation Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex print:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative w-76 max-w-[84vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 animate-in slide-in-from-left duration-200 z-10">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold">
                    প্র
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">ProshnoAI</div>
                    <div className="text-[10px] text-slate-500">মোবাইল প্রশ্ন এডিটর</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Paper Summary Card */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                <div className="text-xs font-extrabold text-emerald-950 truncate">
                  {headerConfig.subject || 'প্রশ্নপত্র'}
                </div>
                <div className="text-[11px] text-emerald-800 truncate">
                  {headerConfig.grade || 'দাখিল'} · {headerConfig.institutionName}
                </div>
                <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                  <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200">
                    {questionCount}টি প্রশ্ন
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-emerald-200">
                    মোট {totalMarks} নম্বর
                  </span>
                </div>
              </div>

              {/* Editor Quick Actions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2">এডিটর অ্যাকশন</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSetupWizard();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 transition"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>নতুন প্রশ্নপত্র উইজার্ড</span>
                </button>

                {isArabicPaper && onLoadArabicPdfPreset && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLoadArabicPdfPreset();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 transition"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>বোর্ড প্রশ্নপত্র (PDF নমুনা)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenKeyModal();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-amber-600" />
                    <span>AI Engine ও API Key</span>
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasApiKey ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                </button>
              </div>

              {/* Site Navigation */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2">অন্যান্য পেজ</p>
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>হোম পেজ</span>
                </Link>
                <Link
                  href="/bank"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>প্রশ্ন ব্যাংক</span>
                </Link>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Canva-Style মোবাইল প্রশ্ন এডিটর</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
