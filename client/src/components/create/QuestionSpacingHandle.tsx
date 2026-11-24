'use client';

import React, { useState, useRef, useEffect } from 'react';

interface QuestionSpacingHandleProps {
  edge: 'top' | 'bottom';
  value: number;
  onLiveChange: (val: number | null) => void;
  onCommit: (val: number) => void;
  min?: number;
  max?: number;
}

export const QuestionSpacingHandle: React.FC<QuestionSpacingHandleProps> = ({
  edge,
  value,
  onLiveChange,
  onCommit,
  min = -12,
  max = 80,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(value);
  const startYRef = useRef(0);
  const startValRef = useRef(value);
  const latestValRef = useRef(value);

  useEffect(() => {
    if (!isDragging) {
      setDragValue(value);
      latestValRef.current = value;
    }
  }, [value, isDragging]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaY = Math.round(e.clientY - startYRef.current);
      const next = Math.max(min, Math.min(max, startValRef.current + deltaY));
      latestValRef.current = next;
      setDragValue(next);
      onLiveChange(next);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      onLiveChange(null);
      if (latestValRef.current !== startValRef.current) {
        onCommit(latestValRef.current);
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
  }, [isDragging, min, max, onLiveChange, onCommit]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startYRef.current = e.clientY;
    startValRef.current = value;
    latestValRef.current = value;
    setDragValue(value);
    setIsDragging(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLiveChange(null);
    onCommit(0);
  };

  const displayVal = isDragging ? dragValue : value;
  const label = edge === 'top' ? 'টপ' : 'বটম';
  const formattedVal = displayVal > 0 ? `+${displayVal}px` : `${displayVal}px`;

  return (
    <div
      className={`print:hidden absolute left-0 right-0 z-20 flex items-center justify-center pointer-events-none select-none ${
        edge === 'top' ? '-top-1.5 h-3' : '-bottom-1.5 h-3'
      }`}
    >
      {/* Subtle dashed guide line */}
      <div
        className={`w-full border-t border-dashed transition-colors ${
          isDragging ? 'border-emerald-600' : 'border-emerald-500/70'
        }`}
      />

      {/* Centered interactive grab pill + live px badge (only the center pill captures drag) */}
      <div
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        title={`${label} স্পেস: ${formattedVal} (টেনে বড়/ছোট করুন • ডাবল-ক্লিকে রিসেট)`}
        className="absolute flex items-center gap-1 px-3 py-1.5 pointer-events-auto cursor-ns-resize touch-none"
      >
        <span
          className={`inline-block rounded-full transition-all shadow-xs ${
            isDragging
              ? 'w-11 h-2 bg-emerald-600 ring-2 ring-emerald-300'
              : 'w-8 h-1.5 bg-emerald-500 hover:bg-emerald-600'
          }`}
        />
        {(isDragging || displayVal !== 0) && (
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0 rounded-full leading-tight shadow-xs border ${
              isDragging
                ? 'bg-emerald-700 text-white border-emerald-800'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {label} {formattedVal}
          </span>
        )}
      </div>
    </div>
  );
};
