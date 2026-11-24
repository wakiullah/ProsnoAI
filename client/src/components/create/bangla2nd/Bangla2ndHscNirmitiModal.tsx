'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import {
  Bangla2ndHscQuestionConfig,
  BENGALI_OPTION_LETTERS,
  DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS,
  formatBengaliMarks2Digit,
} from './bangla2ndDefaults';
import {
  Bangla2ndHscSubPartEditor,
  deserializeSubQToHscSubPart,
  serializeHscSubPartToSubQ,
} from './Bangla2ndHscGrammarModal';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';

export interface Bangla2ndHscNirmitiGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractBangla2ndHscNirmitiGroups(
  questions: QuestionData[]
): Bangla2ndHscNirmitiGroup[] {
  const groups: Bangla2ndHscNirmitiGroup[] = [];
  const seen = new Set<string>();

  questions.forEach((q) => {
    if (
      q.groupId &&
      q.groupId.startsWith('bangla2nd-hsc-nirmiti') &&
      !seen.has(q.groupId)
    ) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `নির্মিতি অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });

  return groups;
}

interface Bangla2ndHscNirmitiModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: string;
  subject?: string;
  allGroups: Bangla2ndHscNirmitiGroup[];
  activeGroupId: string | null;
  onSelectGroupId: (groupId: string | null) => void;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

export const Bangla2ndHscNirmitiModal: React.FC<Bangla2ndHscNirmitiModalProps> = ({
  isOpen,
  onClose,
  grade = 'দ্বাদশ শ্রেণি (এইচএসসি)',
  subject = 'বাংলা ২য় পত্র',
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [items, setItems] = useState<Bangla2ndHscQuestionConfig[]>(
    DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS
  );

  useEffect(() => {
    if (!activeGroup) {
      setItems(DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS);
      return;
    }

    const qs = activeGroup.questions.filter(
      (q) => q.typology !== 'GROUP_TITLE' && q.typology !== 'SECTION_TITLE'
    );
    if (qs.length > 0) {
      const hydrated = qs.map((q, idx) => {
        const def =
          DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS[idx] ||
          DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS[0];
        const subs = q.subQuestions || [];

        if (q.groupRole === 'bangla2nd_hsc_essay' || def.isEssayList) {
          return {
            ...def,
            id: q._id || def.id,
            marks: q.marks || 20,
            isEssayList: true,
            partKa: {
              ...def.partKa,
              prompt: q.stemOrPassage || def.partKa.prompt,
            },
            essayOptions:
              subs.length > 0
                ? subs.map((sq) => sq.questionText || '')
                : def.essayOptions,
          };
        }

        return {
          ...def,
          id: q._id || def.id,
          marks: q.marks || 10,
          partKa: deserializeSubQToHscSubPart(subs[0], def.partKa),
          partKha: def.partKha
            ? deserializeSubQToHscSubPart(subs[1], def.partKha)
            : undefined,
        };
      });
      setItems(hydrated);
    }
  }, [activeGroup]);

  const totalMarks = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.marks) || 0), 0),
    [items]
  );

  if (!isOpen) return null;

  const handleUpdateQuestion = (
    idx: number,
    patch: Partial<Bangla2ndHscQuestionConfig>
  ) => {
    const next = [...items];
    next[idx] = { ...next[idx], ...patch };
    setItems(next);
  };

  const buildQuestions = (targetGroupId: string): QuestionData[] => {
    return items.map((it) => {
      const qNumStr = `${toBengaliNumber(it.qNumber)}।`;
      const marksStr = formatBengaliMarks2Digit(it.marks);

      if (it.isEssayList) {
        return {
          groupId: targetGroupId,
          groupRole: 'bangla2nd_hsc_essay',
          subject,
          grade,
          typology: 'DESCRIPTIVE',
          customNumber: qNumStr,
          stemOrPassage: it.partKa.prompt.trim(),
          customMarksText: marksStr,
          subQuestions: (it.essayOptions || []).map((optText, oIdx) => ({
            part: (BENGALI_OPTION_LETTERS[oIdx] || 'ক') as any,
            bloomLevel: 'higher_order',
            bloomTitle: `(${BENGALI_OPTION_LETTERS[oIdx] || 'ক'})`,
            questionText: optText.trim(),
            marks: 0,
          })),
          marks: it.marks,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
        };
      }

      const subQuestions = [
        serializeHscSubPartToSubQ('ক', it.partKa, it.marks),
      ];
      if (it.partKha) {
        subQuestions.push(serializeHscSubPartToSubQ('খ', it.partKha, it.marks));
      }

      return {
        groupId: targetGroupId,
        groupRole: 'bangla2nd_hsc_pair',
        subject,
        grade,
        typology: 'DESCRIPTIVE',
        customNumber: qNumStr,
        stemOrPassage: '',
        customMarksText: marksStr,
        subQuestions,
        marks: it.marks,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
      };
    });
  };

  const handleApply = () => {
    const mode = isEditMode ? 'update' : 'create';
    const targetGroupId =
      isEditMode && activeGroup
        ? activeGroup.groupId
        : `bangla2nd-hsc-nirmiti-${Date.now()}`;
    onSave(buildQuestions(targetGroupId), mode, targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-indigo-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl shrink-0">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold truncate">
                  বাংলা ২য় পত্র (HSC ও আলিম) — নির্মিতি অংশ (৭–১২ নং প্রশ্ন)
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-100 border border-amber-300/30 font-bold">
                  মোট মান: {toBengaliNumber(totalMarks)} / ৭০
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5 truncate">
                ৭. পারিভাষিক/অনুবাদ (১০) • ৮. দিনলিপি/ভাষণ (১০) • ৯. ই-মেইল/আবেদনপত্র (১০) • ১০. সারাংশ/ভাব-সম্প্রসারণ (১০) • ১১. সংলাপ/খুদেগল্প (১০) • ১২. প্রবন্ধ (২০)
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 bg-slate-50/50">
          {items.map((item, qIdx) => {
            const qNumBn = toBengaliNumber(item.qNumber);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-extrabold">
                      প্রশ্ন {qNumBn}।
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                      {item.topicBadge}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                    <span className="text-[11px] font-bold text-slate-600">পূর্ণমান:</span>
                    <input
                      type="number"
                      value={item.marks}
                      onChange={(e) =>
                        handleUpdateQuestion(qIdx, {
                          marks: Number(e.target.value) || 10,
                        })
                      }
                      className="w-10 text-center text-xs font-extrabold bg-white border border-slate-200 rounded py-0.5"
                    />
                  </div>
                </div>

                {item.isEssayList ? (
                  /* Q12: Essay List (ক, খ, গ, ঘ, ঙ) */
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 block mb-1">
                        প্রবন্ধ রচনার নির্দেশনা:
                      </label>
                      <input
                        type="text"
                        value={item.partKa.prompt}
                        onChange={(e) =>
                          handleUpdateQuestion(qIdx, {
                            partKa: { ...item.partKa, prompt: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 text-xs sm:text-sm font-bold rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-2">
                      {(item.essayOptions || []).map((optText, oIdx) => {
                        const letter = BENGALI_OPTION_LETTERS[oIdx] || 'ক';
                        const ph =
                          item.essayPlaceholders?.[oIdx] ||
                          `প্রবন্ধের বিষয় (${letter}) লিখুন...`;
                        return (
                          <div
                            key={oIdx}
                            className="flex items-center gap-2 bg-slate-50/70 p-2 rounded-xl border border-slate-200"
                          >
                            <span className="px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shrink-0">
                              ({letter})
                            </span>
                            <input
                              type="text"
                              value={optText}
                              onChange={(e) => {
                                const next = [...(item.essayOptions || [])];
                                next[oIdx] = e.target.value;
                                handleUpdateQuestion(qIdx, { essayOptions: next });
                              }}
                              placeholder={ph}
                              className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white outline-none focus:border-emerald-500"
                            />
                            {(item.essayOptions?.length || 0) > 3 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = (item.essayOptions || []).filter(
                                    (_, i) => i !== oIdx
                                  );
                                  handleUpdateQuestion(qIdx, { essayOptions: next });
                                }}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {(item.essayOptions?.length || 0) < 6 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuestion(qIdx, {
                              essayOptions: [...(item.essayOptions || []), ''],
                            })
                          }
                          className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ আরও প্রবন্ধের বিষয় যোগ করুন</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Bangla2ndHscSubPartEditor
                      partLabel="(ক)"
                      subPart={item.partKa}
                      onChange={(updatedKa) =>
                        handleUpdateQuestion(qIdx, { partKa: updatedKa })
                      }
                    />

                    <div className="flex items-center justify-center">
                      <span className="px-3 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold">
                        অথবা,
                      </span>
                    </div>

                    {item.partKha && (
                      <Bangla2ndHscSubPartEditor
                        partLabel="(খ)"
                        subPart={item.partKha}
                        onChange={(updatedKha) =>
                          handleUpdateQuestion(qIdx, { partKha: updatedKha })
                        }
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setItems(DEFAULT_BANGLA2ND_HSC_NIRMITI_ITEMS)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট বোর্ড কাঠামোতে রিসেট</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isEditMode
                ? `পেপারে নির্মিতি অংশ আপডেট করুন (${toBengaliNumber(totalMarks)} নম্বর)`
                : `পেপারে নির্মিতি অংশ যোগ করুন (${toBengaliNumber(totalMarks)} নম্বর)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
