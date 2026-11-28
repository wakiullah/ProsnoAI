'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sigma,
  Eye,
  EyeOff,
} from 'lucide-react';
import { QuestionData } from 'proshno-shared';
import { MultiScriptText } from '../../common/MultiScriptText';
import { toBengaliNumber } from '../bangla1st/bangla1stDefaults';
import {
  STD_GROUP_PREFIX,
  STD_MULTI_COMPLETION_OPTIONS,
  StandardMcqEntryType,
  StandardMcqItemConfig,
  StandardSubjectConfig,
} from './standardCqMcqConfig';
import { MathSymbolToolbar } from './MathSymbolToolbar';
import { StimulusMediaEditor } from './StimulusMediaEditor';

export interface StandardMcqGroup {
  groupId: string;
  label: string;
  questions: QuestionData[];
}

export function extractStandardMcqGroups(questions: QuestionData[]): StandardMcqGroup[] {
  const groups: StandardMcqGroup[] = [];
  const seen = new Set<string>();
  questions.forEach((q) => {
    if (q.groupId && q.groupId.startsWith(STD_GROUP_PREFIX.MCQ) && !seen.has(q.groupId)) {
      seen.add(q.groupId);
      groups.push({
        groupId: q.groupId,
        label: `বহুনির্বাচনি অংশ ${groups.length + 1}`,
        questions: questions.filter((item) => item.groupId === q.groupId),
      });
    }
  });
  return groups;
}

interface StandardMcqBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StandardSubjectConfig;
  grade?: string;
  subject?: string;
  allGroups: StandardMcqGroup[];
  activeGroupId: string | null;
  onSave: (
    questions: QuestionData[],
    mode: 'update' | 'create',
    targetGroupId: string
  ) => void;
}

const OPT_LABELS = ['ক', 'খ', 'গ', 'ঘ'] as const;

export const StandardMcqBuilderModal: React.FC<StandardMcqBuilderModalProps> = ({
  isOpen,
  onClose,
  config,
  grade = '১০ম শ্রেণি (এসএসসি)',
  subject,
  allGroups,
  activeGroupId,
  onSave,
}) => {
  const subjectLabel = subject || config.label;
  const activeGroup = useMemo(
    () => (activeGroupId ? allGroups.find((g) => g.groupId === activeGroupId) || null : null),
    [allGroups, activeGroupId]
  );
  const isEditMode = Boolean(activeGroup);

  const [includeTopBanner, setIncludeTopBanner] = useState(true);
  const [showSymbolBar, setShowSymbolBar] = useState(config.showMathToolbarByDefault);
  const [showPreview, setShowPreview] = useState(config.showMathToolbarByDefault);
  const [items, setItems] = useState<StandardMcqItemConfig[]>(config.defaultMcqItems);

  const activeFieldRef = useRef<{ apply: (snippet: string) => void } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setShowSymbolBar(config.showMathToolbarByDefault);
    setShowPreview(config.showMathToolbarByDefault);

    if (!activeGroup) {
      setIncludeTopBanner(true);
      setItems(
        config.defaultMcqItems.map((it) => ({
          ...it,
          options: [...it.options] as [string, string, string, string],
        }))
      );
      return;
    }

    const qs = activeGroup.questions;
    setIncludeTopBanner(qs.some((q) => q.groupRole === 'std_mcq_banner'));

    const reconstructed: StandardMcqItemConfig[] = [];
    for (let i = 0; i < qs.length; i += 1) {
      const q = qs[i];
      if (q.groupRole === 'std_mcq_banner' || q.typology === 'GROUP_TITLE' || q.typology === 'SECTION_TITLE') {
        continue;
      }
      if (q.typology === 'PASSAGE_ONLY' && q.groupRole === 'std_mcq_stem') {
        const linked: StandardMcqItemConfig['linkedQuestions'] = [];
        let j = i + 1;
        while (j < qs.length && qs[j].groupRole === 'std_mcq_linked') {
          const lq = qs[j];
          const opts = (lq.options || []).map((o) => o.text);
          const correctIdx = Math.max(0, (lq.options || []).findIndex((o) => o.isCorrect));
          linked.push({
            id: lq._id || `std_lq_${j}`,
            subType: lq.typology === 'MULTIPLE_COMPLETION_MCQ' ? 'MULTIPLE_COMPLETION' : 'SIMPLE',
            questionText: lq.stemOrPassage || '',
            statements:
              lq.statements && lq.statements.length >= 3
                ? [lq.statements[0], lq.statements[1], lq.statements[2]]
                : ['', '', ''],
            options: [opts[0] || '', opts[1] || '', opts[2] || '', opts[3] || ''],
            correctIndex: correctIdx,
          });
          j += 1;
        }
        i = j - 1;
        reconstructed.push({
          id: q._id || `std_stem_${i}`,
          entryType: 'STEM_GROUP',
          questionText: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          stimulusImage: q.stimulusImage,
          stimulusTable: q.stimulusTable,
          stemInstruction: q.topic || 'নিচের উদ্দীপকটি পড়ে পরবর্তী প্রশ্নগুলোর উত্তর দাও:',
          stemPassage: q.stemOrPassage || '',
          linkedQuestions: linked,
        });
        continue;
      }

      if (q.typology === 'SIMPLE_MCQ' || q.typology === 'MULTIPLE_COMPLETION_MCQ') {
        const opts = (q.options || []).map((o) => o.text);
        const correctIdx = Math.max(0, (q.options || []).findIndex((o) => o.isCorrect));
        reconstructed.push({
          id: q._id || `std_mcq_${i}`,
          entryType: q.typology === 'MULTIPLE_COMPLETION_MCQ' ? 'MULTIPLE_COMPLETION' : 'SIMPLE',
          questionText: q.stemOrPassage || '',
          statements:
            q.statements && q.statements.length >= 3
              ? [q.statements[0], q.statements[1], q.statements[2]]
              : ['', '', ''],
          options: [opts[0] || '', opts[1] || '', opts[2] || '', opts[3] || ''],
          correctIndex: correctIdx,
          stimulusImage: q.stimulusImage,
          stimulusTable: q.stimulusTable,
        });
      }
    }

    setItems(reconstructed.length > 0 ? reconstructed : config.defaultMcqItems.map((it) => ({ ...it })));
  }, [isOpen, activeGroup, config]);

  if (!isOpen) return null;

  const totalQuestionCount = items.reduce(
    (acc, it) => acc + (it.entryType === 'STEM_GROUP' ? it.linkedQuestions?.length || 0 : 1),
    0
  );

  const updateItem = (id: string, patch: Partial<StandardMcqItemConfig>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const handleAddMcq = (entryType: StandardMcqEntryType) => {
    const id = `std_mcq_${Date.now()}_${items.length}`;
    if (entryType === 'MULTIPLE_COMPLETION') {
      setItems((prev) => [
        ...prev,
        {
          id,
          entryType: 'MULTIPLE_COMPLETION',
          questionText: '',
          statements: ['', '', ''],
          options: [...STD_MULTI_COMPLETION_OPTIONS],
          correctIndex: 0,
        },
      ]);
    } else if (entryType === 'STEM_GROUP') {
      setItems((prev) => [
        ...prev,
        {
          id,
          entryType: 'STEM_GROUP',
          questionText: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          stemInstruction: 'নিচের উদ্দীপকটি পড়ে পরবর্তী ২টি প্রশ্নের উত্তর দাও:',
          stemPassage: '',
          linkedQuestions: [
            { id: `${id}_l1`, subType: 'SIMPLE', questionText: '', options: ['', '', '', ''], correctIndex: 0 },
            { id: `${id}_l2`, subType: 'SIMPLE', questionText: '', options: ['', '', '', ''], correctIndex: 0 },
          ],
        },
      ]);
    } else {
      setItems((prev) => [
        ...prev,
        { id, entryType: 'SIMPLE', questionText: '', options: ['', '', '', ''], correctIndex: 0 },
      ]);
    }
  };

  const handleSaveToCanvas = () => {
    const targetGroupId = activeGroup ? activeGroup.groupId : `${STD_GROUP_PREFIX.MCQ}-${Date.now()}`;
    const generated: QuestionData[] = [];

    if (includeTopBanner) {
      generated.push({
        subject: subjectLabel,
        grade,
        typology: 'GROUP_TITLE',
        stemOrPassage: `বহুনির্বাচনি অভীক্ষা (সকল প্রশ্নের উত্তর দাও)`,
        customMarksText: `১×${toBengaliNumber(totalQuestionCount || config.mcqCount)} = ${toBengaliNumber(totalQuestionCount || config.mcqCount)}`,
        marks: totalQuestionCount || config.mcqCount,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
        groupId: targetGroupId,
        groupRole: 'std_mcq_banner',
      });
    }

    let qNum = 1;
    items.forEach((it) => {
      if (it.entryType === 'STEM_GROUP') {
        const linked = it.linkedQuestions || [];
        const startNum = qNum;
        const endNum = qNum + Math.max(0, linked.length - 1);
        const autoInst =
          it.stemInstruction?.trim() ||
          `নিচের উদ্দীপকটি পড়ে ${toBengaliNumber(startNum)} ও ${toBengaliNumber(endNum)} নং প্রশ্নের উত্তর দাও:`;

        generated.push({
          subject: subjectLabel,
          grade,
          topic: autoInst,
          typology: 'PASSAGE_ONLY',
          stemOrPassage: `${autoInst}\n${it.stemPassage || ''}`.trim(),
          stimulusImage: it.stimulusImage,
          stimulusTable: it.stimulusTable,
          marks: 0,
          difficulty: 'Medium',
          languages: ['bn'],
          sourceType: 'MANUAL',
          groupId: targetGroupId,
          groupRole: 'std_mcq_stem',
        });

        linked.forEach((lq) => {
          generated.push({
            subject: subjectLabel,
            grade,
            typology: lq.subType === 'MULTIPLE_COMPLETION' ? 'MULTIPLE_COMPLETION_MCQ' : 'SIMPLE_MCQ',
            stemOrPassage: lq.questionText.trim() || `প্রশ্ন ${toBengaliNumber(qNum)}`,
            statements: lq.subType === 'MULTIPLE_COMPLETION' ? lq.statements : undefined,
            options: lq.options.map((txt, oIdx) => ({
              label: OPT_LABELS[oIdx],
              text: txt,
              isCorrect: lq.correctIndex === oIdx,
            })),
            customNumber: `${toBengaliNumber(qNum)}.`,
            customMarksText: '',
            marks: 1,
            difficulty: 'Medium',
            languages: ['bn'],
            sourceType: 'MANUAL',
            groupId: targetGroupId,
            groupRole: 'std_mcq_linked',
          });
          qNum += 1;
        });
        return;
      }

      generated.push({
        subject: subjectLabel,
        grade,
        typology: it.entryType === 'MULTIPLE_COMPLETION' ? 'MULTIPLE_COMPLETION_MCQ' : 'SIMPLE_MCQ',
        stemOrPassage: it.questionText.trim() || `প্রশ্ন ${toBengaliNumber(qNum)}`,
        statements: it.entryType === 'MULTIPLE_COMPLETION' ? it.statements : undefined,
        stimulusImage: it.stimulusImage,
        stimulusTable: it.stimulusTable,
        options: it.options.map((txt, oIdx) => ({
          label: OPT_LABELS[oIdx],
          text: txt,
          isCorrect: it.correctIndex === oIdx,
        })),
        customNumber: `${toBengaliNumber(qNum)}.`,
        customMarksText: '',
        marks: 1,
        difficulty: 'Medium',
        languages: ['bn'],
        sourceType: 'MANUAL',
        groupId: targetGroupId,
        groupRole: 'std_mcq_item',
      });
      qNum += 1;
    });

    onSave(generated, isEditMode ? 'update' : 'create', targetGroupId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:border sm:border-slate-200">
        {/* Minimal Header */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3 bg-indigo-700 text-white shrink-0">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold truncate">
              {config.label} — বহুনির্বাচনি ({toBengaliNumber(config.mcqCount)})
            </h2>
            <p className="text-[10px] sm:text-xs text-indigo-100 truncate">
              {toBengaliNumber(totalQuestionCount)}/{toBengaliNumber(config.mcqCount)}টি • সময়: {config.mcqTime}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/15 shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Controls + Symbol Bar */}
        <div className="px-2.5 py-1.5 sm:px-5 sm:py-2 bg-slate-50 border-b border-slate-200 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto whitespace-nowrap text-[11px]">
            <div className="flex items-center gap-2 shrink-0">
              <label className="inline-flex items-center gap-1 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTopBanner}
                  onChange={(e) => setIncludeTopBanner(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                শিরোনাম
              </label>
              {config.showMathToolbarByDefault && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowSymbolBar((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                      showSymbolBar ? 'bg-indigo-100 border-indigo-300 text-indigo-800' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <Sigma className="w-3 h-3" /> সূত্র
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${
                      showPreview ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {showPreview ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />} প্রিভিউ
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                {toBengaliNumber(totalQuestionCount)}/{toBengaliNumber(config.mcqCount)}
              </span>
              <button
                type="button"
                onClick={() => setItems(config.defaultMcqItems.map((it) => ({ ...it })))}
                className="p-1 rounded-md border border-slate-300 bg-white"
                title="ডিফল্ট রিসেট"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {showSymbolBar && (
            <MathSymbolToolbar onInsert={(snippet) => activeFieldRef.current?.apply(snippet)} />
          )}
        </div>

        {/* High-Density Body */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2.5 sm:px-5 sm:py-3.5 space-y-2.5 bg-slate-50/40">
          {items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">
                    {toBengaliNumber(idx + 1)}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700">
                    {item.entryType === 'SIMPLE'
                      ? 'সাধারণ MCQ'
                      : item.entryType === 'MULTIPLE_COMPLETION'
                      ? 'বহুপদী (i, ii, iii)'
                      : 'উদ্দীপকভিত্তিক গুচ্ছ'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                  title="মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 sm:p-3 space-y-2">
                {item.entryType === 'STEM_GROUP' ? (
                  <>
                    <input
                      type="text"
                      value={item.stemInstruction || ''}
                      onChange={(e) => updateItem(item.id, { stemInstruction: e.target.value })}
                      placeholder="নির্দেশনা..."
                      className="w-full text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-300 outline-none"
                    />
                    <textarea
                      rows={2}
                      value={item.stemPassage || ''}
                      onFocus={() => {
                        activeFieldRef.current = {
                          apply: (sn) => updateItem(item.id, { stemPassage: (item.stemPassage || '') + sn }),
                        };
                      }}
                      onChange={(e) => updateItem(item.id, { stemPassage: e.target.value })}
                      placeholder="উদ্দীপক লিখুন..."
                      className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 outline-none"
                    />
                    <StimulusMediaEditor
                      image={item.stimulusImage}
                      table={item.stimulusTable}
                      onChangeImage={(stimulusImage) => updateItem(item.id, { stimulusImage })}
                      onChangeTable={(stimulusTable) => updateItem(item.id, { stimulusTable })}
                    />
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-200">
                      {(item.linkedQuestions || []).map((lq, lIdx) => (
                        <div key={lq.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                          <input
                            type="text"
                            value={lq.questionText}
                            onFocus={() => {
                              activeFieldRef.current = {
                                apply: (sn) => {
                                  const next = [...(item.linkedQuestions || [])];
                                  next[lIdx] = { ...lq, questionText: lq.questionText + sn };
                                  updateItem(item.id, { linkedQuestions: next });
                                },
                              };
                            }}
                            onChange={(e) => {
                              const next = [...(item.linkedQuestions || [])];
                              next[lIdx] = { ...lq, questionText: e.target.value };
                              updateItem(item.id, { linkedQuestions: next });
                            }}
                            placeholder={`গুচ্ছ প্রশ্ন ${toBengaliNumber(lIdx + 1)}...`}
                            className="w-full text-sm px-2 py-1 rounded border border-slate-300 bg-white outline-none"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            {lq.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = [...(item.linkedQuestions || [])];
                                    next[lIdx] = { ...lq, correctIndex: oIdx };
                                    updateItem(item.id, { linkedQuestions: next });
                                  }}
                                  className={`w-5 h-5 rounded-full text-[11px] font-bold shrink-0 ${
                                    lq.correctIndex === oIdx
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-white border border-slate-300 text-slate-700'
                                  }`}
                                >
                                  {OPT_LABELS[oIdx]}
                                </button>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const next = [...(item.linkedQuestions || [])];
                                    const nextOpts = [...lq.options] as [string, string, string, string];
                                    nextOpts[oIdx] = e.target.value;
                                    next[lIdx] = { ...lq, options: nextOpts };
                                    updateItem(item.id, { linkedQuestions: next });
                                  }}
                                  placeholder={`অপশন ${OPT_LABELS[oIdx]}`}
                                  className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-slate-300 bg-white outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={item.questionText}
                      onFocus={() => {
                        activeFieldRef.current = {
                          apply: (sn) => updateItem(item.id, { questionText: item.questionText + sn }),
                        };
                      }}
                      onChange={(e) => updateItem(item.id, { questionText: e.target.value })}
                      placeholder="প্রশ্ন লিখুন..."
                      className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                    />
                    {showPreview && item.questionText.includes('$') && (
                      <div className="px-2 py-1 rounded bg-indigo-50/50 border border-indigo-200/60 text-xs font-serif">
                        <MultiScriptText text={item.questionText} />
                      </div>
                    )}

                    <StimulusMediaEditor
                      image={item.stimulusImage}
                      table={item.stimulusTable}
                      onChangeImage={(stimulusImage) => updateItem(item.id, { stimulusImage })}
                      onChangeTable={(stimulusTable) => updateItem(item.id, { stimulusTable })}
                    />

                    {item.entryType === 'MULTIPLE_COMPLETION' && (
                      <div className="space-y-1">
                        {(['i', 'ii', 'iii'] as const).map((rom, sIdx) => (
                          <div key={rom} className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-500 w-4">{rom}.</span>
                            <input
                              type="text"
                              value={item.statements?.[sIdx] || ''}
                              onFocus={() => {
                                activeFieldRef.current = {
                                  apply: (sn) => {
                                    const next = [...(item.statements || ['', '', ''])] as [string, string, string];
                                    next[sIdx] = (next[sIdx] || '') + sn;
                                    updateItem(item.id, { statements: next });
                                  },
                                };
                              }}
                              onChange={(e) => {
                                const next = [...(item.statements || ['', '', ''])] as [string, string, string];
                                next[sIdx] = e.target.value;
                                updateItem(item.id, { statements: next });
                              }}
                              placeholder={`তথ্য ${rom}...`}
                              className="flex-1 min-w-0 text-xs px-2 py-1 rounded border border-slate-300 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      {item.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, { correctIndex: oIdx })}
                            className={`w-5 h-5 rounded-full text-[11px] font-bold shrink-0 ${
                              item.correctIndex === oIdx
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 border border-slate-300 text-slate-700'
                            }`}
                            title="সঠিক উত্তর"
                          >
                            {OPT_LABELS[oIdx]}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onFocus={() => {
                              activeFieldRef.current = {
                                apply: (sn) => {
                                  const nextOpts = [...item.options] as [string, string, string, string];
                                  nextOpts[oIdx] = (nextOpts[oIdx] || '') + sn;
                                  updateItem(item.id, { options: nextOpts });
                                },
                              };
                            }}
                            onChange={(e) => {
                              const nextOpts = [...item.options] as [string, string, string, string];
                              nextOpts[oIdx] = e.target.value;
                              updateItem(item.id, { options: nextOpts });
                            }}
                            placeholder={`অপশন ${OPT_LABELS[oIdx]}`}
                            className="flex-1 min-w-0 text-xs px-2 py-1 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Add Buttons */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleAddMcq('SIMPLE')}
              className="py-2 rounded-xl border border-dashed border-indigo-400 bg-indigo-50/50 text-indigo-700 font-bold text-[11px] inline-flex items-center justify-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> সাধারণ
            </button>
            <button
              type="button"
              onClick={() => handleAddMcq('MULTIPLE_COMPLETION')}
              className="py-2 rounded-xl border border-dashed border-violet-400 bg-violet-50/50 text-violet-700 font-bold text-[11px] inline-flex items-center justify-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> বহুপদী
            </button>
            <button
              type="button"
              onClick={() => handleAddMcq('STEM_GROUP')}
              className="py-2 rounded-xl border border-dashed border-sky-400 bg-sky-50/50 text-sky-700 font-bold text-[11px] inline-flex items-center justify-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" /> গুচ্ছ
            </button>
          </div>
        </div>

        {/* Slim Footer */}
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-5 sm:py-3 bg-white border-t border-slate-200 shrink-0">
          <span className="text-[11px] text-slate-600">
            মোট <strong>{toBengaliNumber(totalQuestionCount)}</strong>টি MCQ
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-700"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSaveToCanvas}
              disabled={totalQuestionCount === 0}
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isEditMode ? 'আপডেট' : 'যুক্ত করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
