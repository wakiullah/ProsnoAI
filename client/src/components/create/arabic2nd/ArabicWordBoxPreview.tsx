'use client';

import React from 'react';

interface ArabicWordBoxPreviewProps {
  words: string[];
  className?: string;
}

export const ArabicWordBoxPreview: React.FC<ArabicWordBoxPreviewProps> = ({
  words,
  className = '',
}) => {
  if (!words || words.length === 0) return null;

  return (
    <div className={`my-2 flex items-center justify-center ${className}`}>
      <table
        dir="rtl"
        style={{
          borderCollapse: 'collapse',
          border: '1.5px solid #1e293b',
          backgroundColor: '#f8fafc',
          margin: '0 auto',
        }}
        className="border-collapse border border-slate-800 bg-slate-50 text-xs font-serif font-bold text-slate-900 shadow-2xs rounded-xs overflow-hidden"
      >
        <tbody>
          <tr>
            {words.map((w, idx) => (
              <td
                key={idx}
                style={{
                  border: '1px solid #334155',
                  padding: '4px 14px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
                className="border border-slate-700 px-3.5 py-1 text-center whitespace-nowrap"
              >
                <span>{w.trim()}</span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
