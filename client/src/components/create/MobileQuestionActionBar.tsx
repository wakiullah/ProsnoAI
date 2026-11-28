'use client';

import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Wand2,
  X,
  MoveVertical,
  Minus,
  Plus,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import { useMobileKeyboardOpen } from '../../hooks/useMobileKeyboardOpen';

interface MobileQuestionActionBarProps {
  question: QuestionData;
  questionIndex: number;
  totalQuestions: number;
  onDeselect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdate: (updated: QuestionData) => void;
  onEdit?: () => void;
}

export const MobileQuestionActionBar: React.FC<MobileQuestionActionBarProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onDeselect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onUpdate,
  onEdit,
}) => {
  const [showSpacingPanel, setShowSpacingPanel] = useState(false);
  const isKeyboardOpen = useMobileKeyboardOpen();

  if (isKeyboardOpen) return null;

  const spacingTop = question.spacingTop ?? 0;
  const spacingBottom = question.spacingBottom ?? 0;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 print:hidden">
      {/* Mini Spacing Sub-Bar when toggled */}
      {showSpacingPanel && (
        <div className="mx-3 mb-2 p-2.5 bg-white/95 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">টপ:</span>
            <button
              type="button"
              onClick={() =>
                onUpdate({ ...question, spacingTop: Math.max(-12, spacingTop - 4) })
              }
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-emerald-700 min-w-[32px] text-center">
              {spacingTop > 0 ? `+${spacingTop}` : spacingTop}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdate({ ...question, spacingTop: Math.min(80, spacingTop + 4) })
              }
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600">বটম:</span>
            <button
              type="button"
              onClick={() =>
                onUpdate({ ...question, spacingBottom: Math.max(-12, spacingBottom - 4) })
              }
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-emerald-700 min-w-[32px] text-center">
              {spacingBottom > 0 ? `+${spacingBottom}` : spacingBottom}
            </span>
            <button
              type="button"
              onClick={() =>
                onUpdate({ ...question, spacingBottom: Math.min(80, spacingBottom + 4) })
              }
              className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center active:scale-90"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Contextual Action Bar */}
      <div className="bg-slate-900 text-white border-t border-slate-700 shadow-2xl px-2 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex flex-col items-center justify-center px-3 py-1 rounded-xl bg-emerald-600 text-white shrink-0 active:scale-95 transition"
            >
              <Wand2 className="w-4 h-4" />
              <span className="text-[10px] font-bold mt-0.5">এডিট</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onUpdate({ ...question, keepTogether: !question.keepTogether })}
            className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-xl shrink-0 active:scale-95 transition ${
              question.keepTogether ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-200'
            }`}
          >
            <span className="text-[11px] font-extrabold">{question.keepTogether ? '🔒' : '↔'}</span>
            <span className="text-[10px] font-bold mt-0.5">
              {question.keepTogether ? 'একসাথে' : 'অটো-ফ্লো'}
            </span>
          </button>

          <button
            type="button"
            onClick={onMoveUp}
            disabled={questionIndex <= 0}
            className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl hover:bg-slate-800 disabled:opacity-30 shrink-0 active:scale-95 transition"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">উপরে</span>
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={questionIndex >= totalQuestions - 1}
            className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl hover:bg-slate-800 disabled:opacity-30 shrink-0 active:scale-95 transition"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">নিচে</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSpacingPanel((v) => !v)}
            className={`flex flex-col items-center justify-center px-2.5 py-1 rounded-xl shrink-0 active:scale-95 transition ${
              showSpacingPanel ? 'bg-emerald-700 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <MoveVertical className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">স্পেস</span>
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl hover:bg-slate-800 shrink-0 active:scale-95 transition"
          >
            <Copy className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">কপি</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex flex-col items-center justify-center px-2.5 py-1 rounded-xl text-rose-400 hover:bg-rose-950/60 shrink-0 active:scale-95 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[10px] font-semibold mt-0.5">মুছুন</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onDeselect}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 active:scale-95 transition ml-1"
          aria-label="নির্বাচন বাতিল করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
