'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExamSection, QuestionData } from 'proshno-shared';
import { QuestionCardRenderer } from '../question-types/QuestionCardRenderer';
import { GripVertical, FolderInput } from 'lucide-react';

interface SortableQuestionItemProps {
  id: string;
  question: QuestionData;
  index: number;
  sections?: ExamSection[];
  onAssignSection?: (sectionId?: string) => void;
  onUpdate: (updated: QuestionData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export const SortableQuestionItem: React.FC<SortableQuestionItemProps> = ({
  id,
  question,
  index,
  sections,
  onAssignSection,
  onUpdate,
  onDelete,
  onDuplicate,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  const assignedSection = sections?.find((s) => s.id === question.sectionId);
  const cardElementId = `question-card-${question._id || id}`;

  return (
    <div
      ref={setNodeRef}
      id={cardElementId}
      style={style}
      className="relative group transition-all duration-300 rounded-lg"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-[-10px] top-8 p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded cursor-grab active:cursor-grabbing text-slate-500 z-10 shadow-sm opacity-0 group-hover:opacity-100 transition"
        title="ড্র্যাগ করে ক্রম পরিবর্তন করুন (Drag to reorder)"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Section Assignment Bar (Only shown if sections exist) */}
      {sections && sections.length > 0 && (
        <div className="flex items-center justify-between text-[11px] mb-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-t-lg text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                assignedSection ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>
              {assignedSection ? (
                <span className="font-bold text-slate-800">{assignedSection.name}</span>
              ) : (
                <span className="text-slate-400">সাধারণ প্রশ্ন (বিভাগহীন)</span>
              )}
            </span>
          </div>

          {onAssignSection && (
            <div className="flex items-center gap-1">
              <FolderInput className="w-3 h-3 text-slate-400" />
              <select
                value={question.sectionId || ''}
                onChange={(e) => onAssignSection(e.target.value || undefined)}
                className="text-[11px] py-0.5 px-1.5 border border-slate-300 rounded bg-white font-medium text-slate-700 hover:border-emerald-500 transition cursor-pointer"
              >
                <option value="">সাধারণ (বিভাগ ছাড়া)</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Question Card Content with Single, Clean Action Bar inside */}
      <QuestionCardRenderer
        question={question}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
    </div>
  );
};
