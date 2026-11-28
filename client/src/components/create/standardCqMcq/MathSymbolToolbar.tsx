'use client';

import React, { useState } from 'react';
import { Sigma, Check } from 'lucide-react';

interface SymbolItem {
  label: string;
  insert: string;
  title: string;
}

type CategoryKey = 'basic' | 'algebra' | 'geometry' | 'trig' | 'science';
type MiniBuilderMode = null | 'frac' | 'pow' | 'sqrt' | 'sub';

const CATEGORIES: { id: CategoryKey; label: string; items: SymbolItem[] }[] = [
  {
    id: 'basic',
    label: 'মৌলিক',
    items: [
      { label: 'x²', insert: '$x^2$', title: 'বর্গ' },
      { label: 'x³', insert: '$x^3$', title: 'ঘন' },
      { label: '√x', insert: '$\\sqrt{x}$', title: 'বর্গমূল' },
      { label: '½', insert: '$\\frac{1}{2}$', title: 'হাফ' },
      { label: 'π', insert: '$\\pi$', title: 'পাই' },
      { label: '°', insert: '$^\\circ$', title: 'ডিগ্রি' },
      { label: '±', insert: '$\\pm$', title: 'প্লাস-মাইনাস' },
      { label: '×', insert: '$\\times$', title: 'গুণ' },
      { label: '÷', insert: '$\\div$', title: 'ভাগ' },
      { label: '≤', insert: '$\\le$', title: 'ছোট বা সমান' },
      { label: '≥', insert: '$\\ge$', title: 'বড় বা সমান' },
      { label: '≠', insert: '$\\ne$', title: 'অসমান' },
    ],
  },
  {
    id: 'algebra',
    label: 'বীজগণিত',
    items: [
      { label: 'x+1/x', insert: '$x + \\frac{1}{x}$', title: 'x + 1/x' },
      { label: 'x²+1/x²', insert: '$x^2 + \\frac{1}{x^2}$', title: 'x² + 1/x²' },
      { label: 'x³-1/x³', insert: '$x^3 - \\frac{1}{x^3}$', title: 'x³ - 1/x³' },
      { label: 'a²-b²', insert: '$a^2 - b^2$', title: 'a² - b²' },
      { label: '(a+b)²', insert: '$(a + b)^2$', title: '(a+b)²' },
      { label: 'f(x)', insert: '$f(x)$', title: 'ফাংশন' },
      { label: 'log', insert: '$\\log_{10}$', title: 'লগারিদম' },
      { label: '∑', insert: '$\\sum$', title: 'সমষ্টি' },
    ],
  },
  {
    id: 'geometry',
    label: 'জ্যামিতি',
    items: [
      { label: '∠ABC', insert: '$\\angle ABC$', title: 'কোণ' },
      { label: '△ABC', insert: '$\\triangle ABC$', title: 'ত্রিভুজ' },
      { label: '90°', insert: '$90^\\circ$', title: 'সমকোণ' },
      { label: '⊥', insert: '$\\perp$', title: 'লম্ব' },
      { label: '∥', insert: '$\\parallel$', title: 'সমান্তরাল' },
      { label: '≅', insert: '$\\cong$', title: 'সর্বসম' },
      { label: 'πr²', insert: '$\\pi r^2$', title: 'বৃত্তের ক্ষেত্রফল' },
      { label: '2πr', insert: '$2\\pi r$', title: 'বৃত্তের পরিধি' },
    ],
  },
  {
    id: 'trig',
    label: 'ত্রিকোণমিতি',
    items: [
      { label: 'sin θ', insert: '$\\sin\\theta$', title: 'সাইন থিটা' },
      { label: 'cos θ', insert: '$\\cos\\theta$', title: 'কস থিটা' },
      { label: 'tan θ', insert: '$\\tan\\theta$', title: 'ট্যান থিটা' },
      { label: 'sec θ', insert: '$\\sec\\theta$', title: 'সেক থিটা' },
      { label: 'cot θ', insert: '$\\cot\\theta$', title: 'কট থিটা' },
      { label: 'θ', insert: '$\\theta$', title: 'থিটা' },
      { label: 'α', insert: '$\\alpha$', title: 'আলফা' },
      { label: 'β', insert: '$\\beta$', title: 'বিটা' },
    ],
  },
  {
    id: 'science',
    label: 'পদার্থ/রসায়ন',
    items: [
      { label: '→', insert: '$\\rightarrow$', title: 'বিক্রিয়া তীর' },
      { label: '⇌', insert: '$\\rightleftharpoons$', title: 'উভমুখী বিক্রিয়া' },
      { label: 'Δ', insert: '$\\Delta$', title: 'ডেল্টা / তাপ' },
      { label: 'Ω', insert: '$\\Omega$', title: 'ওহম' },
      { label: 'μ', insert: '$\\mu$', title: 'মিউ' },
      { label: 'm/s²', insert: '$\\text{m/s}^2$', title: 'ত্বরণের একক' },
      { label: '10⁻⁶', insert: '$10^{-6}$', title: 'বৈজ্ঞানিক সূচক' },
      { label: 'H₂O', insert: '$\\text{H}_2\\text{O}$', title: 'পানি' },
      { label: 'CO₂', insert: '$\\text{CO}_2$', title: 'কার্বন ডাই-অক্সাইড' },
      { label: 'H₂SO₄', insert: '$\\text{H}_2\\text{SO}_4$', title: 'সালফিউরিক এসিড' },
      { label: 'CaCO₃', insert: '$\\text{CaCO}_3$', title: 'ক্যালসিয়াম কার্বনেট' },
    ],
  },
];

interface MathSymbolToolbarProps {
  onInsert: (snippet: string) => void;
  compact?: boolean;
}

export const MathSymbolToolbar: React.FC<MathSymbolToolbarProps> = ({ onInsert }) => {
  const [activeCat, setActiveCat] = useState<CategoryKey>('basic');
  const [builderMode, setBuilderMode] = useState<MiniBuilderMode>(null);
  const [valA, setValA] = useState('');
  const [valB, setValB] = useState('');

  const currentCat = CATEGORIES.find((c) => c.id === activeCat) || CATEGORIES[0];

  const openBuilder = (mode: MiniBuilderMode) => {
    if (builderMode === mode) {
      setBuilderMode(null);
      return;
    }
    setBuilderMode(mode);
    setValA('');
    setValB('');
  };

  const applyBuilder = () => {
    const a = valA.trim();
    const b = valB.trim();
    if (!a && !b) return;
    if (builderMode === 'frac') {
      onInsert(`$\\frac{${a || '1'}}{${b || '2'}}$`);
    } else if (builderMode === 'pow') {
      onInsert(`$${a || 'x'}^{${b || '2'}}$`);
    } else if (builderMode === 'sqrt') {
      onInsert(`$\\sqrt{${a || 'x'}}$`);
    } else if (builderMode === 'sub') {
      onInsert(`$${a || 'x'}_{${b || '1'}}$`);
    }
    setBuilderMode(null);
    setValA('');
    setValB('');
  };

  return (
    <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/40 px-2 py-1.5 space-y-1.5">
      {/* Row 1: Category pills + Easy-Peasy Zero-LaTeX Builders (single scrollable line on mobile) */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-0.5">
        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-700 mr-0.5 shrink-0">
          <Sigma className="w-3 h-3" />
        </span>

        {/* Zero-LaTeX Mini Builders */}
        {(
          [
            { id: 'frac', label: '+ ভগ্নাংশ' },
            { id: 'pow', label: '+ ঘাত' },
            { id: 'sqrt', label: '+ রুট' },
            { id: 'sub', label: '+ সাব' },
          ] as const
        ).map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => openBuilder(b.id)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border shrink-0 transition ${
              builderMode === b.id
                ? 'bg-indigo-600 border-indigo-700 text-white'
                : 'bg-white border-indigo-300 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {b.label}
          </button>
        ))}

        <span className="text-slate-300 text-xs mx-0.5">|</span>

        {/* Category Switcher */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setActiveCat(cat.id);
            }}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md shrink-0 transition ${
              activeCat === cat.id
                ? 'bg-slate-800 text-white'
                : 'bg-white/80 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Optional Inline Mini Formula Builder (No LaTeX typing needed!) */}
      {builderMode && (
        <div className="flex flex-wrap items-center gap-1.5 bg-white border border-indigo-200 rounded-md px-2 py-1.5 text-xs">
          {builderMode === 'frac' && (
            <>
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                placeholder="লব (যেমন: 1)"
                className="w-24 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
                autoFocus
              />
              <span className="font-bold text-slate-500">/</span>
              <input
                type="text"
                value={valB}
                onChange={(e) => setValB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyBuilder()}
                placeholder="হর (যেমন: x)"
                className="w-24 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
              />
            </>
          )}
          {builderMode === 'pow' && (
            <>
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                placeholder="ভিত্তি (যেমন: x)"
                className="w-24 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
                autoFocus
              />
              <span className="font-bold text-slate-500">^</span>
              <input
                type="text"
                value={valB}
                onChange={(e) => setValB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyBuilder()}
                placeholder="ঘাত (যেমন: 2)"
                className="w-20 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
              />
            </>
          )}
          {builderMode === 'sqrt' && (
            <>
              <span className="font-bold text-slate-600">√</span>
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyBuilder()}
                placeholder="রুটের ভিতরের মান (যেমন: 6)"
                className="w-40 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
                autoFocus
              />
            </>
          )}
          {builderMode === 'sub' && (
            <>
              <input
                type="text"
                value={valA}
                onChange={(e) => setValA(e.target.value)}
                placeholder="প্রতীক (যেমন: R)"
                className="w-24 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
                autoFocus
              />
              <span className="font-bold text-slate-500">_</span>
              <input
                type="text"
                value={valB}
                onChange={(e) => setValB(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyBuilder()}
                placeholder="নিচে (যেমন: 1)"
                className="w-20 px-1.5 py-1 text-xs rounded border border-slate-300 outline-none focus:border-indigo-500"
              />
            </>
          )}
          <button
            type="button"
            onClick={applyBuilder}
            className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold"
          >
            <Check className="w-3 h-3" /> বসান
          </button>
        </div>
      )}

      {/* Row 2: One-Tap Symbol Chips (single horizontal scroll row on mobile) */}
      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap pb-0.5">
        {currentCat.items.map((sym) => (
          <button
            key={sym.label}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onInsert(sym.insert);
            }}
            title={sym.title}
            className="px-2 py-0.5 text-[11px] font-semibold bg-white hover:bg-indigo-100 active:bg-indigo-200 text-slate-800 border border-indigo-200/80 rounded-md shrink-0 transition cursor-pointer"
          >
            {sym.label}
          </button>
        ))}
      </div>
    </div>
  );
};
