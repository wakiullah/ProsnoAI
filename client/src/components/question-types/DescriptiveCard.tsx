'use client';

import React, { useState } from 'react';
import { QuestionData, WritingBoxConfig, stripArabicHarakat } from 'proshno-shared';
import { MultiScriptText } from '../common/MultiScriptText';
import { FileText, Check, Edit2, Plus, Trash2, Wand2, AlignLeft, Grid, Copy } from 'lucide-react';

interface DescriptiveCardProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
}

export const DescriptiveCard: React.FC<DescriptiveCardProps> = ({
  question,
  index,
  onUpdate,
  onDelete,
  onAddToPaper,
  onDuplicate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [stem, setStem] = useState(question.stemOrPassage || '');
  const [answer, setAnswer] = useState(String(question.correctAnswer || ''));
  const [marks, setMarks] = useState<number>(question.marks || 2);
  const [answerSpaceLines, setAnswerSpaceLines] = useState<number>(question.answerSpaceLines || 0);
  const [writingBoxes, setWritingBoxes] = useState<WritingBoxConfig | undefined>(question.writingBoxes);

  // Sub-questions for Tarjama & Tashreeh or multi-part descriptive questions
  const [subQuestions, setSubQuestions] = useState<Array<{ part: string; questionText: string; marks?: number }>>(() => {
    if (question.subQuestions && question.subQuestions.length > 0) {
      return question.subQuestions.map((sq) => ({
        part: sq.part,
        questionText: sq.questionText,
        marks: sq.marks,
      }));
    }
    if (question.typology === 'TARJAMA_TASHREEH') {
      return [
        { part: '১', questionText: 'উক্ত ইবারতটির প্রাঞ্জল বঙ্গানুবাদ (তরজমা) লেখ।', marks: 4 },
        { part: '২', questionText: 'ইবারতটির প্রাসঙ্গিক ব্যাখ্যা ও বিধানসমূহ (তাশরীহ) বিশদভাবে লেখ।', marks: 6 },
      ];
    }
    return [];
  });

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      const totalSubMarks = subQuestions.reduce((acc, sq) => acc + (sq.marks || 0), 0);
      onUpdate({
        ...question,
        stemOrPassage: stem,
        correctAnswer: answer,
        marks: totalSubMarks > 0 ? totalSubMarks : marks,
        subQuestions: subQuestions.length > 0 ? (subQuestions as any) : undefined,
        answerSpaceLines: answerSpaceLines > 0 ? answerSpaceLines : undefined,
        writingBoxes: writingBoxes && (writingBoxes.count || writingBoxes.rows) ? writingBoxes : undefined,
      });
    }
  };

  const handleStripHarakat = () => {
    const stripped = stripArabicHarakat(stem);
    setStem(stripped);
    if (!isEditing && onUpdate) {
      onUpdate({
        ...question,
        stemOrPassage: stripArabicHarakat(question.stemOrPassage || ''),
      });
    }
  };

  const getTypologyBadge = () => {
    switch (question.typology) {
      case 'TARJAMA_TASHREEH':
        return {
          label: 'তরজমা ও তাশরীহ',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'TAHQEEQ_SIGHA':
        return {
          label: 'তাহকীক ও সীগাহ',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'TARKIB_IRAB':
        return {
          label: 'তারকীব ও এ\'রাব',
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'HURUF_TAJWEED':
        return {
          label: 'হুরূফ ও তাজবীদ',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      default:
        return {
          label: 'সংক্ষিপ্ত / বর্ণনামূলক',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
    }
  };

  const badge = getTypologyBadge();
  const hasArabicChars = /[\u0600-\u06FF]/.test(isEditing ? stem : (question.stemOrPassage || ''));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded border ${badge.className}`}>
            <FileText className="w-3 h-3" />
            {badge.label}
          </span>
          <span className="text-xs text-slate-500 font-medium">মান: {question.marks}</span>
          {question.answerSpaceLines && question.answerSpaceLines > 0 ? (
            <span className="text-[11px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
              ফাঁকা লাইন: {question.answerSpaceLines}টি
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          {hasArabicChars && (
            <button
              onClick={handleStripHarakat}
              type="button"
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded border border-amber-200 hover:bg-amber-100 transition"
              title="আরবি হরকত মুছে শুধু মূল হরফ বা এবারত রাখুন"
            >
              <Wand2 className="w-3 h-3 text-amber-600" />
              <span>হরকত মুছুন</span>
            </button>
          )}

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

      {isEditing ? (
        <div className="space-y-3 mt-2 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">প্রশ্নের মূল অংশ / এবারত:</label>
              {hasArabicChars && (
                <button
                  type="button"
                  onClick={handleStripHarakat}
                  className="text-amber-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Wand2 className="w-3 h-3" />
                  হরকত মুছুন (Strip Harakat)
                </button>
              )}
            </div>
            <textarea
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              className="w-full text-sm p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">নম্বর (Marks):</label>
              <input
                type="number"
                min="1"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                উত্তর লেখার ফাঁকা লাইন (নূরানী/প্রাথমিক):
              </label>
              <select
                value={answerSpaceLines}
                onChange={(e) => setAnswerSpaceLines(Number(e.target.value))}
                className="w-full p-1.5 border border-slate-300 rounded bg-white"
              >
                <option value={0}>লাইন নেই (উচ্চতর/সাধারণ)</option>
                <option value={2}>২টি ফাঁকা ডটেড লাইন</option>
                <option value={4}>৪টি ফাঁকা ডটেড লাইন</option>
                <option value={6}>৬টি ফাঁকা ডটেড লাইন</option>
                <option value={8}>৮টি ফাঁকা ডটেড লাইন</option>
              </select>
            </div>
          </div>

          {/* Writing Boxes Config for Noorani/Primary Handwriting */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-900 text-xs">
                হাতের লেখার বক্স (নূরানী / শিশু ওয়ার্কশীট):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setWritingBoxes(
                      writingBoxes?.type === 'row'
                        ? undefined
                        : { type: 'row', count: 4 }
                    )
                  }
                  className={`text-[11px] px-2 py-0.5 rounded border transition ${
                    writingBoxes?.type === 'row'
                      ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  এক সারিতে বক্স
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setWritingBoxes(
                      writingBoxes?.type === 'grid'
                        ? undefined
                        : { type: 'grid', rows: 3, cols: 5 }
                    )
                  }
                  className={`text-[11px] px-2 py-0.5 rounded border transition ${
                    writingBoxes?.type === 'grid'
                      ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  গ্রিড / ছক বক্স
                </button>
                {writingBoxes && (
                  <button
                    type="button"
                    onClick={() => setWritingBoxes(undefined)}
                    className="text-[11px] text-red-600 hover:underline px-1"
                  >
                    বক্স সরান
                  </button>
                )}
              </div>
            </div>

            {writingBoxes?.type === 'row' && (
              <div className="flex items-center gap-2 pt-1">
                <label className="text-[11px] text-slate-600 font-medium">বক্স সংখ্যা:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={writingBoxes.count || 4}
                  onChange={(e) =>
                    setWritingBoxes({
                      ...writingBoxes,
                      count: Number(e.target.value) || 1,
                    })
                  }
                  className="w-20 p-1 border border-slate-300 rounded text-xs text-center font-bold"
                />
                <span className="text-[11px] text-slate-500">(যেমন ৪টি, ৬টি, ১০টি খালি বক্স)</span>
              </div>
            )}

            {writingBoxes?.type === 'grid' && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-600 font-medium">সারি (Rows):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={writingBoxes.rows || 3}
                    onChange={(e) =>
                      setWritingBoxes({
                        ...writingBoxes,
                        rows: Number(e.target.value) || 1,
                      })
                    }
                    className="w-16 p-1 border border-slate-300 rounded text-xs text-center font-bold"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-slate-600 font-medium">কলাম (Cols):</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={writingBoxes.cols || 5}
                    onChange={(e) =>
                      setWritingBoxes({
                        ...writingBoxes,
                        cols: Number(e.target.value) || 1,
                      })
                    }
                    className="w-16 p-1 border border-slate-300 rounded text-xs text-center font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sub-questions editor (Tarjama, Tashreeh, or descriptive sub-parts) */}
          <div className="border border-purple-200 bg-purple-50/40 rounded p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-900 text-xs">
                উপ-প্রশ্নসমূহ (তরজমা, তাশরীহ বা অন্যান্য অংশ):
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextPart = (subQuestions.length + 1).toString();
                  setSubQuestions([
                    ...subQuestions,
                    { part: nextPart, questionText: '', marks: 5 },
                  ]);
                }}
                className="text-xs text-purple-700 hover:text-purple-900 font-medium flex items-center gap-1 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded transition"
              >
                <Plus className="w-3 h-3" />
                <span>উপ-প্রশ্ন যোগ করুন</span>
              </button>
            </div>

            {subQuestions.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">কোনো উপ-প্রশ্ন নেই। একক প্রশ্ন হিসেবে সংরক্ষিত হবে।</p>
            ) : (
              <div className="space-y-2">
                {subQuestions.map((sq, sqIdx) => (
                  <div key={sqIdx} className="flex items-start gap-2 bg-white p-2 rounded border border-purple-100 shadow-xs">
                    <div className="w-16">
                      <label className="text-[10px] text-slate-500 block mb-0.5">অংশ/নম্বর</label>
                      <input
                        type="text"
                        value={sq.part}
                        onChange={(e) => {
                          const updated = [...subQuestions];
                          updated[sqIdx].part = e.target.value;
                          setSubQuestions(updated);
                        }}
                        placeholder="১ বা ক"
                        className="w-full text-xs p-1 border border-slate-300 rounded text-center font-bold"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-slate-500 block mb-0.5">উপ-প্রশ্নের বিবরণ / প্রশ্ন</label>
                      <textarea
                        rows={2}
                        value={sq.questionText}
                        onChange={(e) => {
                          const updated = [...subQuestions];
                          updated[sqIdx].questionText = e.target.value;
                          setSubQuestions(updated);
                        }}
                        placeholder="উক্ত ইবারতটির প্রাঞ্জল বঙ্গানুবাদ..."
                        className="w-full text-xs p-1 border border-slate-300 rounded"
                      />
                    </div>
                    <div className="w-16">
                      <label className="text-[10px] text-slate-500 block mb-0.5">নম্বর</label>
                      <input
                        type="number"
                        min="1"
                        value={sq.marks ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Number(e.target.value);
                          const updated = [...subQuestions];
                          updated[sqIdx].marks = val;
                          setSubQuestions(updated);
                        }}
                        className="w-full text-xs p-1 border border-slate-300 rounded text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSubQuestions(subQuestions.filter((_, i) => i !== sqIdx));
                      }}
                      className="mt-5 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                      title="উপ-প্রশ্ন মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">নমুনা উত্তর / শিক্ষক নির্দেশিকা:</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full text-xs p-2 border border-slate-300 rounded"
              rows={2}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-slate-800 text-sm font-medium leading-relaxed">
            {typeof index === 'number' && <span className="font-bold mr-1.5">{index}.</span>}
            <MultiScriptText text={question.stemOrPassage} />
          </div>

          {/* Sub-questions display for TARJAMA_TASHREEH or multi-part descriptive questions */}
          {((question.subQuestions && question.subQuestions.length > 0) || (question.typology === 'TARJAMA_TASHREEH' && subQuestions.length > 0)) && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[11px] font-semibold text-purple-900 mb-1">
                উপ-প্রশ্নসমূহ (তরজমা ও তাশরীহ):
              </div>
              {(question.subQuestions && question.subQuestions.length > 0 ? question.subQuestions : subQuestions).map((sq, sqIdx) => (
                <div key={sqIdx} className="flex items-start justify-between text-xs bg-purple-50/50 p-2 rounded border border-purple-100">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-purple-800 min-w-[22px]">({sq.part})</span>
                    <span className="text-slate-800 leading-relaxed">{sq.questionText}</span>
                  </div>
                  {sq.marks != null && (
                    <span className="font-bold text-purple-800 ml-2 whitespace-nowrap bg-purple-100 px-1.5 py-0.5 rounded text-[11px]">
                      [{sq.marks}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tahqeeq Words Table if available */}
          {question.tahqeeqWords && question.tahqeeqWords.length > 0 && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b">
                    <th className="p-1.5 border-r">শব্দ (کلمہ)</th>
                    <th className="p-1.5 border-r">সীগাহ (صیغہ)</th>
                    <th className="p-1.5 border-r">বাহাস (بحث)</th>
                    <th className="p-1.5 border-r">বাব (باب)</th>
                    <th className="p-1.5 border-r">মাদ্দাহ (مادہ)</th>
                    <th className="p-1.5">অর্থ (معنیٰ)</th>
                  </tr>
                </thead>
                <tbody>
                  {question.tahqeeqWords.map((tw, twIdx) => (
                    <tr key={twIdx} className="border-b hover:bg-slate-50">
                      <td className="p-1.5 border-r font-bold font-ar text-sm">{tw.lafz}</td>
                      <td className="p-1.5 border-r">{tw.sigha || '-'}</td>
                      <td className="p-1.5 border-r">{tw.bahas || '-'}</td>
                      <td className="p-1.5 border-r">{tw.baab || '-'}</td>
                      <td className="p-1.5 border-r">{tw.maddah || '-'}</td>
                      <td className="p-1.5">{tw.meaning || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Writing Boxes Preview for Noorani/Primary */}
          {question.writingBoxes && (
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto py-1">
              {question.writingBoxes.type === 'grid' ? (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <Grid className="w-3 h-3 text-emerald-600" />
                  ছক গ্রিড: {question.writingBoxes.rows}×{question.writingBoxes.cols} টেবিল
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-500 mr-1">খালি বক্স:</span>
                  <div className="flex items-center">
                    {Array.from({ length: Math.min(question.writingBoxes.count || 4, 10) }).map((_, bIdx) => (
                      <div
                        key={bIdx}
                        className="w-4 h-4 border border-slate-400 bg-slate-50 -mr-[1px]"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold ml-1.5">
                    ({question.writingBoxes.count || 4}টি)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
