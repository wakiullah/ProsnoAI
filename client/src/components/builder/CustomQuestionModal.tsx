'use client';

import React, { useState } from 'react';
import {
  CqSubQuestion,
  McqOption,
  QuestionData,
  QuestionTypology,
  stripArabicHarakat,
} from 'proshno-shared';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { Plus, X, FileEdit, Wand2 } from 'lucide-react';

interface CustomQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSectionId?: string;
}

export const CustomQuestionModal: React.FC<CustomQuestionModalProps> = ({
  isOpen,
  onClose,
  defaultSectionId,
}) => {
  const { addQuestion, headerConfig, sections } = usePaperCartStore();

  const [typology, setTypology] = useState<QuestionTypology>('SIMPLE_MCQ');
  const [sectionId, setSectionId] = useState<string | undefined>(defaultSectionId);
  const [stem, setStem] = useState('');
  const [marks, setMarks] = useState<number>(1);
  const [explanation, setExplanation] = useState('');

  // MCQ State
  const [options, setOptions] = useState<McqOption[]>([
    { label: 'ক', text: '', isCorrect: true },
    { label: 'খ', text: '', isCorrect: false },
    { label: 'গ', text: '', isCorrect: false },
    { label: 'ঘ', text: '', isCorrect: false },
  ]);

  // Multiple Completion Statements
  const [statements, setStatements] = useState<string[]>([
    'তথ্য বা বিবৃতি ১',
    'তথ্য বা বিবৃতি ২',
    'তথ্য বা বিবৃতি ৩',
  ]);

  // CQ Bloom's Sub-questions
  const [cqSubQuestions, setCqSubQuestions] = useState<CqSubQuestion[]>([
    { part: 'ক', bloomLevel: 'knowledge', bloomTitle: 'জ্ঞানমূলক', questionText: '', marks: 1 },
    { part: 'খ', bloomLevel: 'comprehension', bloomTitle: 'অনুধাবনমূলক', questionText: '', marks: 2 },
    { part: 'গ', bloomLevel: 'application', bloomTitle: 'প্রয়োগমূলক', questionText: '', marks: 3 },
    { part: 'ঘ', bloomLevel: 'higher_order', bloomTitle: 'উচ্চতর দক্ষতা', questionText: '', marks: 4 },
  ]);

  // Fill in the blanks state
  const [hasClues, setHasClues] = useState(false);
  const [wordClues, setWordClues] = useState<string>('');
  const [fillAnswers, setFillAnswers] = useState<string>('');

  // Matching Columns State
  const [colA, setColA] = useState<string[]>(['বাক্যাংশ ক১', 'বাক্যাংশ ক২', 'বাক্যাংশ ক৩']);
  const [colB, setColB] = useState<string[]>(['বাক্যাংশ খ১', 'বাক্যাংশ খ২', 'বাক্যাংশ খ৩']);

  if (!isOpen) return null;

  const handleTypologyChange = (t: QuestionTypology) => {
    setTypology(t);
    if (t === 'CQ') setMarks(10);
    else if (t === 'SIMPLE_MCQ' || t === 'MULTIPLE_COMPLETION_MCQ') setMarks(1);
    else if (t === 'FILL_BLANKS') setMarks(5);
    else if (t === 'MATCHING') setMarks(4);
    else if (
      t === 'TARJAMA_TASHREEH' ||
      t === 'TAHQEEQ_SIGHA' ||
      t === 'TARKIB_IRAB' ||
      t === 'HURUF_TAJWEED'
    ) {
      setMarks(5);
    } else {
      setMarks(2);
    }
  };

  const handleSave = () => {
    if (!stem.trim()) {
      alert('অনুগ্রহ করে প্রশ্নের মূল অংশ বা উদ্দীপক লিখুন।');
      return;
    }

    // Auto-inherit subject and grade from the exam paper header
    const subjectName = headerConfig.subject || headerConfig.kitab || 'সাধারণ বিষয়';

    const question: QuestionData = {
      _id: `custom-${Date.now()}`,
      subject: subjectName,
      grade: headerConfig.grade || 'সাধারণ',
      typology,
      sectionId: sectionId || undefined,
      stemOrPassage: stem,
      marks: Number(marks) || 1,
      explanation: explanation.trim() || undefined,
      difficulty: 'Medium',
      languages: /[\u0600-\u06FF]/.test(stem) ? ['ar', 'bn'] : ['bn'],
      sourceType: 'MANUAL',
    };

    if (typology === 'SIMPLE_MCQ') {
      question.options = options;
      question.correctAnswer = options.find((o) => o.isCorrect)?.label || 'ক';
    } else if (typology === 'MULTIPLE_COMPLETION_MCQ') {
      question.statements = statements;
      question.options = options;
      question.correctAnswer = options.find((o) => o.isCorrect)?.label || 'ক';
    } else if (typology === 'CQ') {
      question.subQuestions = cqSubQuestions;
    } else if (typology === 'FILL_BLANKS') {
      question.hasClues = hasClues;
      question.wordClues = wordClues ? wordClues.split(',').map((w) => w.trim()) : [];
      question.correctAnswer = fillAnswers ? fillAnswers.split(',').map((w) => w.trim()) : [];
    } else if (typology === 'MATCHING') {
      question.matchingColumns = {
        colA,
        colB,
        correctPairs: colA.map((_, i) => ({ a: i, b: i, fullSentence: `${colA[i]} ${colB[i]}` })),
      };
    }

    addQuestion(question);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                কাস্টম প্রশ্ন যোগ করুন (Add Question)
              </h2>
              <p className="text-[11px] text-slate-500">
                বিষয়: <span className="font-semibold text-slate-700">{headerConfig.subject || headerConfig.kitab || 'সাধারণ'}</span> (স্বয়ংক্রিয়ভাবে যুক্ত হবে)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Typology Switcher Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">প্রশ্নের ধরন নির্বাচন করুন:</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'SIMPLE_MCQ', label: 'সাধারণ MCQ' },
              { id: 'MULTIPLE_COMPLETION_MCQ', label: 'বহুপদী MCQ' },
              { id: 'CQ', label: 'সৃজনশীল (CQ)' },
              { id: 'FILL_BLANKS', label: 'শূন্যস্থান' },
              { id: 'MATCHING', label: 'মিলকরণ' },
              { id: 'MULTI_PART', label: 'বহুধাপ প্রশ্ন (ক, খ, গ)' },
              { id: 'QAWAID_MISAL', label: 'ব্যাকরণ ও নির্ণয়মূলক' },
              { id: 'TARKIB_IRAB', label: 'তারকীব ও এ\'রাব' },
              { id: 'TAHQEEQ_SIGHA', label: 'তাহকীক ও সীগাহ' },
              { id: 'TARJAMA_TASHREEH', label: 'তরজমা ও তাশরীহ' },
              { id: 'HURUF_TAJWEED', label: 'হুরূফ ও তাজবীদ' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTypologyChange(tab.id as QuestionTypology)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  typology === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Marks & Section selection row (Subject removed!) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">প্রশ্নের পূর্ণমান (Marks):</label>
              <input
                type="number"
                min="1"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value) || 1)}
                className="w-full p-2 border border-slate-300 rounded-lg font-bold text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {sections && sections.length > 0 && (
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  বিভাগ নির্বাচন (Assign to Section):
                </label>
                <select
                  value={sectionId || ''}
                  onChange={(e) => setSectionId(e.target.value || undefined)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-medium focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">(সাধারণ / কোনো বিভাগ ছাড়া)</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} {sec.displayMarksFormula ? `(${sec.displayMarksFormula})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Question Stem / Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                {typology === 'CQ' ? 'উদ্দীপক বা মূল প্রশ্ন (Question Stem):' : 'প্রশ্নের মূল অংশ (Question):'}
              </label>
              {/[\u0600-\u06FF]/.test(stem) && (
                <button
                  type="button"
                  onClick={() => setStem(stripArabicHarakat(stem))}
                  className="text-amber-700 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Wand2 className="w-3 h-3" />
                  হরকত মুছুন (Strip Harakat)
                </button>
              )}
            </div>
            <textarea
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              placeholder="এখানে প্রশ্নটি লিখুন (যেমন: বাংলাদেশের জাতীয় কবি কে? অথবা উদ্দীপক লিখুন)..."
              className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs leading-relaxed"
              rows={3}
            />
          </div>

          {/* Type specific fields */}
          {typology === 'MULTIPLE_COMPLETION_MCQ' && (
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="font-semibold text-slate-700 block">তথ্যসমূহ (i, ii, iii):</label>
              {statements.map((stmt, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 w-5">
                    {['i.', 'ii.', 'iii.'][sIdx]}
                  </span>
                  <input
                    type="text"
                    value={stmt}
                    onChange={(e) => {
                      const updated = [...statements];
                      updated[sIdx] = e.target.value;
                      setStatements(updated);
                    }}
                    className="flex-1 p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {(typology === 'SIMPLE_MCQ' || typology === 'MULTIPLE_COMPLETION_MCQ') && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="font-semibold text-slate-700 block">
                অপশনসমূহ (ক, খ, গ, ঘ) ও সঠিক উত্তর নির্বাচন:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updated = options.map((o, idx) => ({
                          ...o,
                          isCorrect: idx === oIdx,
                        }));
                        setOptions(updated);
                      }}
                      className="accent-emerald-600"
                    />
                    <span className="font-bold text-slate-600 w-4">{opt.label})</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[oIdx].text = e.target.value;
                        setOptions(updated);
                      }}
                      placeholder={`অপশন ${opt.label} লিখুন`}
                      className="flex-1 p-1 border-0 focus:ring-0 text-xs text-slate-800"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {typology === 'CQ' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="font-semibold text-slate-700 block">
                সৃজনশীল ৪টি স্তর (ক, খ, গ, ঘ):
              </label>
              {cqSubQuestions.map((sq, sqIdx) => (
                <div key={sqIdx} className="flex items-center gap-2">
                  <span className="font-bold text-indigo-700 w-6">{sq.part})</span>
                  <span className="text-[10px] text-slate-500 w-20">[{sq.bloomTitle}]</span>
                  <input
                    type="text"
                    value={sq.questionText}
                    onChange={(e) => {
                      const updated = [...cqSubQuestions];
                      updated[sqIdx].questionText = e.target.value;
                      setCqSubQuestions(updated);
                    }}
                    placeholder={`প্রশ্ন ${sq.part} লিখুন`}
                    className="flex-1 p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <span className="font-bold text-slate-600 w-8 text-center">[{sq.marks}]</span>
                </div>
              ))}
            </div>
          )}

          {typology === 'FILL_BLANKS' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cluesCheck"
                  checked={hasClues}
                  onChange={(e) => setHasClues(e.target.checked)}
                  className="accent-emerald-600"
                />
                <label htmlFor="cluesCheck" className="font-semibold text-slate-700">
                  ক্লু বক্স যোগ করুন (With Clues)
                </label>
              </div>
              {hasClues && (
                <div>
                  <label className="font-medium text-slate-600 block mb-0.5">
                    ক্লু শব্দগুলো (কমা দিয়ে লিখুন):
                  </label>
                  <input
                    type="text"
                    value={wordClues}
                    onChange={(e) => setWordClues(e.target.value)}
                    placeholder="নদী, পর্বত, আকাশ, বাতাস..."
                    className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              )}
              <div>
                <label className="font-medium text-slate-600 block mb-0.5">
                  সঠিক উত্তরসমূহ (কমা দিয়ে লিখুন):
                </label>
                <input
                  type="text"
                  value={fillAnswers}
                  onChange={(e) => setFillAnswers(e.target.value)}
                  placeholder="উত্তর ১, উত্তর ২, উত্তর ৩..."
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {typology === 'MATCHING' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="font-semibold text-slate-700 block">
                মিলকরণ ছকের তথ্য (কলাম ক এবং কলাম খ):
              </label>
              <div className="space-y-1.5">
                {colA.map((_, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={colA[rIdx] || ''}
                      onChange={(e) => {
                        const updated = [...colA];
                        updated[rIdx] = e.target.value;
                        setColA(updated);
                      }}
                      placeholder={`কলাম ক (${rIdx + 1})`}
                      className="p-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      value={colB[rIdx] || ''}
                      onChange={(e) => {
                        const updated = [...colB];
                        updated[rIdx] = e.target.value;
                        setColB(updated);
                      }}
                      placeholder={`কলাম খ (${rIdx + 1})`}
                      className="p-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setColA([...colA, `বাক্যাংশ ক${colA.length + 1}`]);
                  setColB([...colB, `বাক্যাংশ খ${colB.length + 1}`]);
                }}
                className="text-xs text-emerald-700 font-semibold hover:underline pt-1 block"
              >
                + নতুন সারি যোগ করুন
              </button>
            </div>
          )}

          {/* Explanation (Optional) */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">ব্যাখ্যা বা সমাধান নির্দেশিকা (ঐচ্ছিক):</label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="শিক্ষক নির্দেশিকার জন্য সংক্ষিপ্ত ব্যাখ্যা..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>প্রশ্নপত্রে যোগ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
