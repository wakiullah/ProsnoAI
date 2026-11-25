'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  AqaidFiqhSectionConfig,
  DEFAULT_AQAID_FIQH_SECTIONS,
} from './aqaidFiqhDefaults';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export interface AqaidFiqhWrittenGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractAqaidFiqhWrittenGroups(
  questions: QuestionData[]
): AqaidFiqhWrittenGroup[] {
  const groups: AqaidFiqhWrittenGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('aqaid-fiqh-written') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `রচনামূলক অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface AqaidFiqhWrittenModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: AqaidFiqhWrittenGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const AqaidFiqhWrittenModal: React.FC<AqaidFiqhWrittenModalProps> = ({
  isOpen,
  onClose,
  grade = 'দাখিল ১০ম শ্রেণি',
  subject = 'আকাইদ ও ফিকহ',
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [startFromTwo, setStartFromTwo] = useState(true);
  const [sections, setSections] = useState<AqaidFiqhSectionConfig[]>(
    DEFAULT_AQAID_FIQH_SECTIONS
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastAddedQIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!lastAddedQIdRef.current || !containerRef.current) return;
    const targetId = lastAddedQIdRef.current;
    lastAddedQIdRef.current = null;
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector(
        `[data-aq-qid="${targetId}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const ta = el.querySelector('textarea') as HTMLTextAreaElement | null;
        if (ta) setTimeout(() => ta.focus(), 180);
      }
    });
  }, [sections]);

  // Hydrate when editing an existing group
  useEffect(() => {
    if (!activeGroup) {
      setStartFromTwo(true);
      setSections(DEFAULT_AQAID_FIQH_SECTIONS);
      return;
    }

    const qs = activeGroup.questions;
    const reconstructed: AqaidFiqhSectionConfig[] = [];
    let currentSec: AqaidFiqhSectionConfig | null = null;
    let firstNumDetected = false;

    qs.forEach((q, idx) => {
      if (q.groupRole === 'aqaid_section_banner') {
        const lines = (q.stemOrPassage || '').split('\n');
        currentSec = {
          id: q._id || `aq_sec_${idx}`,
          titleLine: lines[0] || '',
          instructionLine: lines[1] || '',
          marksLine: lines[2] || '',
          sectionMarks: q.marks || 10,
          questions: [],
        };
        reconstructed.push(currentSec);
      } else if (q.groupRole === 'aqaid_written_item') {
        if (!firstNumDetected) {
          firstNumDetected = true;
          const numStr = (q.customNumber || '').trim();
          setStartFromTwo(numStr.startsWith('২') || numStr.startsWith('2'));
        }
        if (!currentSec) {
          currentSec = {
            ...DEFAULT_AQAID_FIQH_SECTIONS[0],
            questions: [],
          };
          reconstructed.push(currentSec);
        }
        currentSec.questions.push({
          id: q._id || `aq_q_${idx}`,
          text: q.stemOrPassage || '',
          placeholder: 'প্রশ্নটি লিখুন (বাংলা ও আরবি মিশ্রিত করা যাবে)...',
        });
      }
    });

    if (reconstructed.length > 0) {
      setSections(reconstructed);
    }
  }, [activeGroup]);

  const { totalMarks, totalQuestions } = useMemo(() => {
    let m = 0;
    let qCount = 0;
    sections.forEach((s) => {
      m += Number(s.sectionMarks) || 0;
      qCount += s.questions.length;
    });
    return { totalMarks: m, totalQuestions: qCount };
  }, [sections]);

  if (!isOpen) return null;

  const handleUpdateSection = (
    sIdx: number,
    patch: Partial<AqaidFiqhSectionConfig>
  ) => {
    const next = [...sections];
    next[sIdx] = { ...next[sIdx], ...patch };
    setSections(next);
  };

  const handleUpdateQuestion = (sIdx: number, qIdx: number, text: string) => {
    const next = [...sections];
    const qs = [...next[sIdx].questions];
    qs[qIdx] = { ...qs[qIdx], text };
    next[sIdx] = { ...next[sIdx], questions: qs };
    setSections(next);
  };

  const handleAddQuestion = (sIdx: number) => {
    const newId = `aq_q_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    lastAddedQIdRef.current = newId;
    const next = [...sections];
    next[sIdx] = {
      ...next[sIdx],
      questions: [
        ...next[sIdx].questions,
        {
          id: newId,
          text: '',
          placeholder: 'নতুন প্রশ্ন লিখুন (প্রয়োজনে আরবি শব্দ যুক্ত করতে পারবেন)...',
        },
      ],
    };
    setSections(next);
  };

  const handleDeleteQuestion = (sIdx: number, qIdx: number) => {
    const next = [...sections];
    next[sIdx] = {
      ...next[sIdx],
      questions: next[sIdx].questions.filter((_, i) => i !== qIdx),
    };
    setSections(next);
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    const list: QuestionData[] = [];
    let seq = startFromTwo ? 2 : 1;

    sections.forEach((sec) => {
      list.push({
        groupId: targetGroupId,
        groupRole: 'aqaid_section_banner',
        subject,
        grade,
        typology: 'GROUP_TITLE',
        customNumber: '',
        stemOrPassage: [
          sec.titleLine.trim(),
          sec.instructionLine.trim(),
          sec.marksLine.trim(),
        ]
          .filter(Boolean)
          .join('\n'),
        customMarksText: '',
        marks: sec.sectionMarks,
        difficulty: 'Easy',
        languages: ['bn', 'ar'],
        sourceType: 'MANUAL',
      });

      sec.questions.forEach((q) => {
        list.push({
          groupId: targetGroupId,
          groupRole: 'aqaid_written_item',
          subject,
          grade,
          typology: 'DESCRIPTIVE',
          customNumber: `${toBengaliNumber(seq)}।`,
          stemOrPassage: q.text.trim(),
          customMarksText: '',
          marks: 0, // Marks are already accounted on section banner (e.g. 10x1=10, 10x2=20)
          difficulty: 'Medium',
          languages: ['bn', 'ar'],
          sourceType: 'MANUAL',
        });
        seq++;
      });
    });

    return list;
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `aqaid-fiqh-written-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId);
    onClose();
  };

  let runningSeq = startFromTwo ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <BookOpen className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  আকাইদ ও ফিকহ — রচনামূলক প্রশ্ন (খ–চ বিভাগ : ৬০ নম্বর)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 font-bold">
                  মোট মান: {toBengaliNumber(totalMarks)} ({toBengaliNumber(totalQuestions)}টি প্রশ্ন)
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                খ. আকাইদ (১০) • গ. ফিকহ (২০) • ঘ. উসূলুল ফিকহ (১০) • ঙ. আখলাক (১০) • চ. ইতিহাস (১০)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Toolbar: Question Numbering Start Option */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <span className="font-bold text-slate-600">
            প্রশ্ন ক্রমিক নম্বর শুরু:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setStartFromTwo(true)}
              className={`px-3 py-1 rounded-lg font-bold border transition ${
                startFromTwo
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              ২। থেকে শুরু (বোর্ড নিয়ম: ক বিভাগ MCQ ১নং)
            </button>
            <button
              type="button"
              onClick={() => setStartFromTwo(false)}
              className={`px-3 py-1 rounded-lg font-bold border transition ${
                !startFromTwo
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              ১। থেকে শুরু
            </button>
          </div>
        </div>

        {/* Body */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50"
        >
          {sections.map((sec, sIdx) => (
            <div
              key={sec.id}
              className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3"
            >
              {/* 3-Line Board Section Banner Editor */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">
                      বিভাগের নাম (১ম লাইন):
                    </label>
                    <input
                      type="text"
                      value={sec.titleLine}
                      onChange={(e) =>
                        handleUpdateSection(sIdx, { titleLine: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-extrabold rounded-lg border border-emerald-200 bg-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">
                      নির্দেশনা (২য় লাইন):
                    </label>
                    <input
                      type="text"
                      value={sec.instructionLine}
                      onChange={(e) =>
                        handleUpdateSection(sIdx, {
                          instructionLine: e.target.value,
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-emerald-200 bg-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-900 block mb-0.5">
                      মান বণ্টন (৩য় লাইন):
                    </label>
                    <input
                      type="text"
                      value={sec.marksLine}
                      onChange={(e) =>
                        handleUpdateSection(sIdx, { marksLine: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-emerald-200 bg-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Questions inside this section */}
              <div className="space-y-2.5">
                {sec.questions.map((q, qIdx) => {
                  const numBn = toBengaliNumber(runningSeq++);
                  return (
                    <div
                      key={q.id}
                      data-aq-qid={q.id}
                      className="flex items-start gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200"
                    >
                      <span className="px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-extrabold shrink-0 mt-0.5">
                        {numBn}।
                      </span>
                      <textarea
                        rows={2}
                        value={q.text}
                        onChange={(e) =>
                          handleUpdateQuestion(sIdx, qIdx, e.target.value)
                        }
                        placeholder={q.placeholder}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-[13px] rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500 leading-relaxed"
                      />
                      {sec.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(sIdx, qIdx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition shrink-0"
                          title="প্রশ্নটি মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handleAddQuestion(sIdx)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ এই বিভাগে আরও ১টি প্রশ্ন যোগ করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSections(DEFAULT_AQAID_FIQH_SECTIONS)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট ৫টি বিভাগে রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isEditMode
                ? `পেপারে রচনামূলক অংশ আপডেট করুন (${toBengaliNumber(totalMarks)} নম্বর)`
                : `পেপারে রচনামূলক অংশ যোগ করুন (${toBengaliNumber(totalMarks)} নম্বর)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
