'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { QuestionData } from 'proshno-shared';
import { SortableQuestionItem } from './SortableQuestionItem';
import { SectionHeaderCard } from './SectionHeaderCard';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { Printer, Sparkles, Plus, Layers, Sparkle } from 'lucide-react';

interface DndQuestionListProps {
  questions: QuestionData[];
  onReorder: (newQuestions: QuestionData[]) => void;
  onUpdateQuestion: (index: number, updated: QuestionData) => void;
  onRemoveQuestion: (index: number) => void;
  onDuplicateQuestion?: (index: number) => void;
  onOpenCustomModal: (defaultSectionId?: string) => void;
  onOpenAiAssistant: () => void;
}

export const DndQuestionList: React.FC<DndQuestionListProps> = ({
  questions,
  onReorder,
  onUpdateQuestion,
  onRemoveQuestion,
  onDuplicateQuestion,
  onOpenCustomModal,
  onOpenAiAssistant,
}) => {
  const {
    sections,
    addSection,
    updateSection,
    removeSection,
    reorderSections,
    assignQuestionToSection,
    getTotalMarks,
    duplicateQuestion,
  } = usePaperCartStore();

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState('ক-বিভাগ : সংক্ষিপ্ত প্রশ্ন');
  const [newSectionInstruction, setNewSectionInstruction] = useState(
    'নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৩টি প্রশ্নের উত্তর দাও:'
  );
  const [newRequiredCount, setNewRequiredCount] = useState<number | ''>(3);
  const [newMarksPerQ, setNewMarksPerQ] = useState<number | ''>(5);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const questionIds = useMemo(() => {
    return questions.map((q, idx) => q._id || `temp-${idx}`);
  }, [questions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = questionIds.indexOf(String(active.id));
      const newIndex = questionIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(questions, oldIndex, newIndex);
        onReorder(reordered);
      }
    }
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    addSection({
      name: newSectionName.trim() || `বিভাগ ${sections.length + 1}`,
      instructions: newSectionInstruction.trim() || undefined,
      requiredCount: typeof newRequiredCount === 'number' ? newRequiredCount : undefined,
      marksPerQuestion: typeof newMarksPerQ === 'number' ? newMarksPerQ : undefined,
    });
    setIsAddingSection(false);
    // Suggest default for next section
    if (sections.length === 0) {
      setNewSectionName('খ-বিভাগ : রচনামূলক প্রশ্ন');
      setNewSectionInstruction('নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৪টি প্রশ্নের উত্তর দাও:');
      setNewRequiredCount(4);
      setNewMarksPerQ(10);
    } else {
      setNewSectionName(`বিভাগ ${sections.length + 2}`);
      setNewSectionInstruction('নিচের যেকোনো ১টি প্রশ্নের উত্তর দাও:');
      setNewRequiredCount(1);
      setNewMarksPerQ(15);
    }
  };

  const handleAddPresetSection = (type: 'short' | 'broad' | 'essay') => {
    if (type === 'short') {
      addSection({
        name: 'ক-বিভাগ : সংক্ষিপ্ত প্রশ্ন',
        instructions: 'নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৩টি প্রশ্নের উত্তর দাও:',
        requiredCount: 3,
        marksPerQuestion: 5,
      });
    } else if (type === 'broad') {
      addSection({
        name: 'খ-বিভাগ : রচনামূলক প্রশ্ন',
        instructions: 'নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৪টি প্রশ্নের উত্তর দাও:',
        requiredCount: 4,
        marksPerQuestion: 10,
      });
    } else {
      addSection({
        name: 'গ-বিভাগ : প্রবন্ধ রচনা / ব্যাকরণ',
        instructions: 'নিচের যেকোনো ১টি প্রশ্নের উত্তর দাও:',
        requiredCount: 1,
        marksPerQuestion: 15,
      });
    }
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= sections.length) return;
    const updated = arrayMove(sections, fromIndex, toIndex);
    reorderSections(updated);
  };

  if (questions.length === 0 && sections.length === 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-4">
        <Printer className="w-10 h-10 mx-auto text-slate-300" />
        <div>
          <p className="text-sm font-semibold text-slate-700">প্রশ্নপত্র বর্তমানে খালি</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            আপনি চাইলে নিজে কাস্টম প্রশ্ন লিখতে পারেন, বিভাগ (ক-বিভাগ, খ-বিভাগ) তৈরি করতে পারেন অথবা পাশের AI সহকারীর সাহায্যে সহজে প্রশ্ন যোগ করতে পারেন।
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onOpenCustomModal()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
          >
            + কাস্টম প্রশ্ন লিখুন
          </button>
          <button
            onClick={() => setIsAddingSection(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ বিভাগ তৈরি করুন</span>
          </button>
          <button
            onClick={onOpenAiAssistant}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI দিয়ে প্রশ্ন তৈরি করুন</span>
          </button>
        </div>

        {/* Create Section Inline Form */}
        {isAddingSection && (
          <form
            onSubmit={handleCreateSection}
            className="max-w-md mx-auto text-left bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-sm space-y-3 mt-4"
          >
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>নতুন বিভাগ তৈরি করুন</span>
            </h4>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                বিভাগের নাম:
              </label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
                placeholder="যেমন: ক-বিভাগ : সংক্ষিপ্ত প্রশ্ন"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                নির্দেশনা:
              </label>
              <input
                type="text"
                value={newSectionInstruction}
                onChange={(e) => setNewSectionInstruction(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
                placeholder="যেমন: নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৩টি প্রশ্নের উত্তর দাও:"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  উত্তর দিতে হবে:
                </label>
                <input
                  type="number"
                  min="1"
                  value={newRequiredCount}
                  onChange={(e) =>
                    setNewRequiredCount(e.target.value ? Number(e.target.value) : '')
                  }
                  className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white font-bold"
                  placeholder="৩"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  প্রতিটির মান:
                </label>
                <input
                  type="number"
                  min="1"
                  value={newMarksPerQ}
                  onChange={(e) =>
                    setNewMarksPerQ(e.target.value ? Number(e.target.value) : '')
                  }
                  className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white font-bold"
                  placeholder="৫"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingSection(false)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded bg-white hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded"
              >
                তৈরি করুন
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Section Manager Button & Quick Presets */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingSection(!isAddingSection)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ নতুন বিভাগ যোগ করুন</span>
          </button>

          {/* Quick presets */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[11px] text-slate-400 ml-1">প্রিসেট:</span>
            <button
              type="button"
              onClick={() => handleAddPresetSection('short')}
              className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 transition"
              title="ক-বিভাগ : সংক্ষিপ্ত প্রশ্ন (৫ × ৩ = ১৫)"
            >
              + ক-বিভাগ (৫×৩=১৫)
            </button>
            <button
              type="button"
              onClick={() => handleAddPresetSection('broad')}
              className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 transition"
              title="খ-বিভাগ : রচনামূলক প্রশ্ন (১০ × ৪ = ৪০)"
            >
              + খ-বিভাগ (১০×৪=৪০)
            </button>
            <button
              type="button"
              onClick={() => handleAddPresetSection('essay')}
              className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 rounded border border-slate-200 transition"
              title="গ-বিভাগ : রচনা / ব্যাকরণ (১৫ × ১ = ১৫)"
            >
              + গ-বিভাগ (১৫×১=১৫)
            </button>
          </div>
        </div>

        <div className="text-xs font-medium text-slate-600">
          মোট বিভাগ: <b className="text-slate-900">{sections.length}</b> টি | প্রশ্ন:{' '}
          <b className="text-slate-900">{questions.length}</b> টি | পূর্ণমান:{' '}
          <b className="text-emerald-700">{getTotalMarks()}</b>
        </div>
      </div>

      {/* Inline Create Section Box */}
      {isAddingSection && (
        <form
          onSubmit={handleCreateSection}
          className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>নতুন বিভাগ তৈরি করুন (Add Section)</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              যেমন: ক-বিভাগ, খ-বিভাগ ও যেকোনো সংখ্যক উত্তরের শর্ত
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                বিভাগের নাম:
              </label>
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
                placeholder="যেমন: ক-বিভাগ : সংক্ষিপ্ত প্রশ্ন"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                নির্দেশনা (Directive/Instruction):
              </label>
              <input
                type="text"
                value={newSectionInstruction}
                onChange={(e) => setNewSectionInstruction(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded bg-white"
                placeholder="যেমন: নিচের প্রশ্নগুলোর মধ্যে যেকোনো ৩টি প্রশ্নের উত্তর দাও:"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                কতটি প্রশ্নের উত্তর দিতে হবে (Required Count):
              </label>
              <input
                type="number"
                min="1"
                value={newRequiredCount}
                onChange={(e) =>
                  setNewRequiredCount(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white font-bold text-emerald-800"
                placeholder="যেমন: ৩"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                প্রতিটি প্রশ্নের মান (Marks Per Question):
              </label>
              <input
                type="number"
                min="1"
                value={newMarksPerQ}
                onChange={(e) =>
                  setNewMarksPerQ(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full p-1.5 text-xs border border-slate-300 rounded bg-white font-bold text-emerald-800"
                placeholder="যেমন: ৫"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingSection(false)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded bg-white hover:bg-slate-100"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm"
            >
              বিভাগ যুক্ত করুন
            </button>
          </div>
        </form>
      )}

      {/* Helpful Hint banner when no sections exist yet */}
      {sections.length === 0 && questions.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              আপনার প্রশ্নপত্রে কি <b>ক-বিভাগ, খ-বিভাগ</b> জাতীয় সেকশন ও চয়েস রুল (যেমন: <i>যেকোনো ৩টির উত্তর দাও: ৫ × ৩ = ১৫</i>) প্রয়োজন?
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddingSection(true)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs shrink-0 transition"
          >
            + বিভাগ তৈরি করুন
          </button>
        </div>
      )}

      {/* Question Groups & Sortable Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={questionIds} strategy={verticalListSortingStrategy}>
          {/* Case A: Sections are defined */}
          {sections.length > 0 ? (
            <div className="space-y-6">
              {sections.map((sec, secIdx) => {
                const sectionQuestions = questions.filter((q) => q.sectionId === sec.id);

                return (
                  <div
                    key={sec.id}
                    className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3"
                  >
                    <SectionHeaderCard
                      section={sec}
                      totalSectionQuestions={sectionQuestions.length}
                      isFirst={secIdx === 0}
                      isLast={secIdx === sections.length - 1}
                      onUpdate={(patch) => updateSection(sec.id, patch)}
                      onDelete={() => removeSection(sec.id)}
                      onMoveUp={() => moveSection(secIdx, secIdx - 1)}
                      onMoveDown={() => moveSection(secIdx, secIdx + 1)}
                      onAddQuestionToSection={() => onOpenCustomModal(sec.id)}
                    />

                    {sectionQuestions.length === 0 ? (
                      <div className="bg-white/80 border border-dashed border-slate-300 rounded-xl p-6 text-center text-xs text-slate-400 space-y-2">
                        <p className="font-semibold text-slate-600">
                          এই বিভাগে এখনও কোনো প্রশ্ন যোগ করা হয়নি
                        </p>
                        <p className="text-[11px] text-slate-400">
                          নিচের বাটনে ক্লিক করে সরাসরি এই বিভাগে কাস্টম প্রশ্ন লিখুন অথবা পাশের AI সহকারীর সাহায্যে প্রশ্ন নিয়ে আসুন।
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenCustomModal(sec.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs inline-flex items-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>এই বিভাগে প্রশ্ন যোগ করুন</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sectionQuestions.map((q) => {
                          const globalIdx = questions.indexOf(q);
                          return (
                            <SortableQuestionItem
                              key={q._id || `q-${globalIdx}`}
                              id={q._id || `q-${globalIdx}`}
                              question={q}
                              index={globalIdx + 1}
                              sections={sections}
                              onAssignSection={(newSecId) =>
                                assignQuestionToSection(globalIdx, newSecId)
                              }
                              onUpdate={(updated) => onUpdateQuestion(globalIdx, updated)}
                              onDelete={() => onRemoveQuestion(globalIdx)}
                              onDuplicate={() =>
                                onDuplicateQuestion
                                  ? onDuplicateQuestion(globalIdx)
                                  : duplicateQuestion(globalIdx)
                              }
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned questions group if any */}
              {questions.some(
                (q) => !q.sectionId || !sections.some((s) => s.id === q.sectionId)
              ) && (
                <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-amber-200/70 pb-2">
                    <span className="flex items-center gap-1.5">
                      <span>সাধারণ / অনির্ধারিত প্রশ্নসমূহ (Unassigned Questions)</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-normal">
                      (এগুলো কোনো বিভাগে অন্তর্ভুক্ত নয়, উপরের ড্রপডাউন দিয়ে বিভাগে নিতে পারেন)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {questions
                      .filter((q) => !q.sectionId || !sections.some((s) => s.id === q.sectionId))
                      .map((q) => {
                        const globalIdx = questions.indexOf(q);
                        return (
                          <SortableQuestionItem
                            key={q._id || `q-${globalIdx}`}
                            id={q._id || `q-${globalIdx}`}
                            question={q}
                            index={globalIdx + 1}
                            sections={sections}
                            onAssignSection={(newSecId) =>
                              assignQuestionToSection(globalIdx, newSecId)
                            }
                            onUpdate={(updated) => onUpdateQuestion(globalIdx, updated)}
                            onDelete={() => onRemoveQuestion(globalIdx)}
                            onDuplicate={() =>
                              onDuplicateQuestion
                                ? onDuplicateQuestion(globalIdx)
                                : duplicateQuestion(globalIdx)
                            }
                          />
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Case B: Standard flat list when no sections are defined */
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <SortableQuestionItem
                  key={q._id || `q-${idx}`}
                  id={q._id || `q-${idx}`}
                  question={q}
                  index={idx + 1}
                  sections={sections}
                  onAssignSection={(newSecId) => assignQuestionToSection(idx, newSecId)}
                  onUpdate={(updated) => onUpdateQuestion(idx, updated)}
                  onDelete={() => onRemoveQuestion(idx)}
                  onDuplicate={() =>
                    onDuplicateQuestion
                      ? onDuplicateQuestion(idx)
                      : duplicateQuestion(idx)
                  }
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default DndQuestionList;
