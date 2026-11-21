'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { Sparkles, FileText, Database, Layers, Printer, Key, Cpu, PanelTopClose, PanelTopOpen, ChevronDown, Menu, X } from 'lucide-react';
import { getActiveAiProvider, getStoredGeminiKey, getStoredOpenRouterKey, AiProvider } from '../../lib/api';
import { ApiKeySettingsModal } from './ApiKeySettingsModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { questions, getTotalMarks, isNavbarVisible, toggleNavbar } = usePaperCartStore();
  const totalMarks = getTotalMarks();

  const [activeProvider, setActiveProvider] = useState<AiProvider>('gemini');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isCreateRoute = pathname === '/create';

  const checkKey = () => {
    const provider = getActiveAiProvider();
    setActiveProvider(provider);
    const hasCurrentKey =
      provider === 'gemini' ? Boolean(getStoredGeminiKey()) : Boolean(getStoredOpenRouterKey());
    setHasApiKey(hasCurrentKey);
  };

  useEffect(() => {
    checkKey();
  }, []);

  const navLinks = [
    { href: '/', label: 'হোম', icon: Layers },
    { href: '/create', label: 'প্রশ্নপত্র তৈরি (/create)', icon: Sparkles },
    { href: '/bank', label: 'প্রশ্ন ব্যাংক', icon: Database },
  ];

  return (
    <>
      {/* Floating Reveal Button when Navbar is Hidden */}
      {!isNavbarVisible && (
        <div className={`${isCreateRoute ? 'hidden lg:block' : ''} fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 print:hidden`}>
          <button
            onClick={toggleNavbar}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/95 hover:bg-white backdrop-blur border border-slate-200/90 shadow-md hover:shadow-lg text-slate-700 hover:text-emerald-700 text-xs font-bold rounded-full transition group"
            title="মেনু প্রদর্শন করুন (Show Menu)"
          >
            <PanelTopOpen className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>মেনু দেখান</span>
          </button>
        </div>
      )}

      <header
        className={`${isCreateRoute ? 'hidden lg:block' : ''} sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 transition-all duration-200 print:hidden ${
          !isNavbarVisible
            ? '-translate-y-full h-0 border-none overflow-hidden opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand + Mobile Hamburger */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition"
              aria-label="নেভিগেশন মেনু"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-200 shrink-0">
                <span className="font-bn text-lg sm:text-xl font-extrabold">প্র</span>
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight flex items-center gap-1.5">
                  <span>ProshnoAI</span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold font-bn hidden xs:inline-block sm:inline-block">
                    প্রশ্ন এআই
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  Multi-Language Question Paper & PDF Generator
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions: AI Key Status + Cart Counter */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Key Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                hasApiKey
                  ? activeProvider === 'gemini'
                    ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                    : 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100 animate-pulse'
              }`}
              title="AI Engine & API Key Settings"
            >
              {hasApiKey ? (
                <>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeProvider === 'gemini' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {activeProvider === 'gemini' ? 'Gemini সক্রিয়' : 'OpenRouter সক্রিয়'}
                  </span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">AI Key বসান</span>
                </>
              )}
            </button>

            {/* Cart Counter / Create Shortcut */}
            <Link
              href="/create"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100/80 transition"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <div className="text-xs">
                <span className="font-bold text-emerald-800">{questions.length}</span>{' '}
                <span className="text-emerald-700">প্রশ্ন</span>
                <span className="mx-1 text-emerald-300">|</span>
                <span className="font-bold text-emerald-800">{totalMarks}</span>{' '}
                <span className="text-emerald-700">মার্কস</span>
              </div>
            </Link>

            {/* Collapse / Hide Navbar Toggle Button */}
            <button
              onClick={toggleNavbar}
              className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="নেভ মেনু হাইড করুন (বড় কাজের জায়গা পান)"
            >
              <PanelTopClose className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-3 py-2.5 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      <ApiKeySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeySaved={checkKey}
      />
    </>
  );
};
