'use client';

import React, { useState } from 'react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { Plus, Trash2, ArrowRightLeft, Edit2, Check, X, Copy } from 'lucide-react';

interface MatchingCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
}

export const MatchingCard: React.FC<MatchingCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stem, setStem] = useState(
    question.stemOrPassage || 'বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলিয়ে অর্থপূর্ণ বাক্য তৈরি কর:'
  );
  const [marks, setMarks] = useState<number>(question.marks || 4);

  // Column items state
  const [colA, setColA] = useState<string[]>(question.matchingColumns?.colA || ['বাক্যাংশ ক১', 'বাক্যাংশ ক২', 'বাক্যাংশ ক৩']);
  const [colB, setColB] = useState<string[]>(question.matchingColumns?.colB || ['বাক্যাংশ খ১', 'বাক্যাংশ খ২', 'বাক্যাংশ খ৩']);
  const [colC, setColC] = useState<string[] | undefined>(question.matchingColumns?.colC);

  const maxRows = Math.max(colA.length, colB.length, colC?.length || 0);

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({
        ...question,
        stemOrPassage: stem,
        marks: Number(marks) || 4,
        matchingColumns: {
          colA,
          colB,
          colC: colC && colC.length > 0 ? colC : undefined,
        },
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setStem(question.stemOrPassage || 'বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলিয়ে অর্থপূর্ণ বাক্য তৈরি কর:');
    setMarks(question.marks || 4);
    setColA(question.matchingColumns?.colA || ['বাক্যাংশ ক১', 'বাক্যাংশ ক২', 'বাক্যাংশ ক৩']);
    setColB(question.matchingColumns?.colB || ['বাক্যাংশ খ১', 'বাক্যাংশ খ২', 'বাক্যাংশ খ৩']);
    setColC(question.matchingColumns?.colC);
  };

  const handleRowChange = (col: 'A' | 'B' | 'C', rIdx: number, val: string) => {
    if (col === 'A') {
      const updated = [...colA];
      updated[rIdx] = val;
      setColA(updated);
    } else if (col === 'B') {
      const updated = [...colB];
      updated[rIdx] = val;
      setColB(updated);
    } else {
      const updated = [...(colC || [])];
      updated[rIdx] = val;
      setColC(updated);
    }
  };

  const handleAddRow = () => {
    setColA([...colA, `বাক্যাংশ ক${colA.length + 1}`]);
    setColB([...colB, `বাক্যাংশ খ${colB.length + 1}`]);
    if (colC) {
      setColC([...colC, `বাক্যাংশ গ${colC.length + 1}`]);
    }
  };

  const handleRemoveRow = (rIdx: number) => {
    if (maxRows <= 1) return;
    setColA(colA.filter((_, i) => i !== rIdx));
    setColB(colB.filter((_, i) => i !== rIdx));
    if (colC) {
      setColC(colC.filter((_, i) => i !== rIdx));
    }
  };

  const toggleColumnC = () => {
    if (colC) {
      setColC(undefined);
    } else {
      setColC(Array.from({ length: maxRows }).map((_, i) => `বাক্যাংশ গ${i + 1}`));
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-cyan-50 text-cyan-700 rounded border border-cyan-200">
            <ArrowRightLeft className="w-3 h-3" />
            মিলকরণ ছক (Matching Table)
          </span>
          <span className="text-xs text-slate-500 font-medium">মান: {marks}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onAddToPaper && (
            <button
              onClick={onAddToPaper}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
              title="Add to Question Paper"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>যুক্ত করুন</span>
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="p-1 text-slate-500 hover:text-emerald-700 rounded hover:bg-emerald-50 transition"
              title="ডুপ্লিকেট করুন"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {onUpdate && (
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 transition"
              title={isEditing ? 'সংরক্ষণ করুন' : 'এডিট করুন'}
            >
              {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-4 h-4" />}
            </button>
          )}

          {isEditing && (
            <button
              onClick={handleCancel}
              className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition"
              title="বাতিল করুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Editing Mode */}
      {isEditing ? (
        <div className="space-y-3 mt-3 border-t border-slate-100 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-3">
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                প্রশ্নের শিরোনাম / নির্দেশনা:
              </label>
              <input
                type="text"
                value={stem}
                onChange={(e) => setStem(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
                placeholder="মিলকরণের নির্দেশনা"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">
                নম্বর (মান):
              </label>
              <input
                type="number"
                min="1"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value) || 1)}
                className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-700">মিলকরণ ছকের তথ্য এডিট করুন:</span>
            <button
              type="button"
              onClick={toggleColumnC}
              className="text-[11px] font-semibold text-emerald-700 hover:underline"
            >
              {colC ? '- কলাম গ বাদ দিন' : '+ কলাম গ (৩য় কলাম) যোগ করুন'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 rounded">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-2 border border-slate-200 text-left font-bold w-12 text-center">নং</th>
                  <th className="p-2 border border-slate-200 text-left font-bold">কলাম ক</th>
                  <th className="p-2 border border-slate-200 text-left font-bold">কলাম খ</th>
                  {colC && <th className="p-2 border border-slate-200 text-left font-bold">কলাম গ</th>}
                  <th className="p-2 border border-slate-200 text-center font-bold w-12">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRows }).map((_, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    <td className="p-2 border border-slate-200 text-center font-bold text-slate-500">
                      {rIdx + 1}
                    </td>
                    <td className="p-1 border border-slate-200">
                      <input
                        type="text"
                        value={colA[rIdx] || ''}
                        onChange={(e) => handleRowChange('A', rIdx, e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                        placeholder={`কলাম ক (${rIdx + 1})`}
                      />
                    </td>
                    <td className="p-1 border border-slate-200">
                      <input
                        type="text"
                        value={colB[rIdx] || ''}
                        onChange={(e) => handleRowChange('B', rIdx, e.target.value)}
                        className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                        placeholder={`কলাম খ (${rIdx + 1})`}
                      />
                    </td>
                    {colC && (
                      <td className="p-1 border border-slate-200">
                        <input
                          type="text"
                          value={colC[rIdx] || ''}
                          onChange={(e) => handleRowChange('C', rIdx, e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500"
                          placeholder={`কলাম গ (${rIdx + 1})`}
                        />
                      </td>
                    )}
                    <td className="p-1 border border-slate-200 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(rIdx)}
                        disabled={maxRows <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 transition"
                        title="এই সারিটি মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ নতুন সারি যোগ করুন</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded text-slate-600 hover:bg-slate-50 transition"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* View Mode */
        <>
          <div className="text-slate-800 text-sm font-medium mb-2.5">
            {typeof index === 'number' && <span className="font-bold mr-1.5">{index}.</span>}
            <MultiScriptText
              text={
                question.stemOrPassage ||
                'বাম পাশের বাক্যাংশের সাথে ডান পাশের বাক্যাংশ মিলিয়ে অর্থপূর্ণ বাক্য তৈরি কর:'
              }
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 rounded">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="p-2 border border-slate-200 text-left font-bold">কলাম ক</th>
                  <th className="p-2 border border-slate-200 text-left font-bold">কলাম খ</th>
                  {colC && <th className="p-2 border border-slate-200 text-left font-bold">কলাম গ</th>}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: maxRows }).map((_, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    <td className="p-2 border border-slate-200">
                      <MultiScriptText text={colA[rIdx] || ''} />
                    </td>
                    <td className="p-2 border border-slate-200">
                      <MultiScriptText text={colB[rIdx] || ''} />
                    </td>
                    {colC && (
                      <td className="p-2 border border-slate-200">
                        <MultiScriptText text={colC[rIdx] || ''} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
