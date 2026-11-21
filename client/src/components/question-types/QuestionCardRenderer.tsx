'use client';

import React from 'react';
import { QuestionData } from 'proshno-shared';
import { SimpleMcqCard } from './SimpleMcqCard';
import { MultipleCompletionCard } from './MultipleCompletionCard';
import { PassageGroupCard } from './PassageGroupCard';
import { CreativeQuestionCard } from './CreativeQuestionCard';
import { FillBlanksCard } from './FillBlanksCard';
import { MatchingCard } from './MatchingCard';
import { DescriptiveCard } from './DescriptiveCard';

export interface QuestionCardRendererProps {
  question: QuestionData;
  index?: number;
  onUpdate?: (updated: QuestionData) => void;
  onDelete?: () => void;
  onAddToPaper?: () => void;
  onDuplicate?: () => void;
  onRegenerate?: () => void;
  isStaging?: boolean;
  /** If true, the "Add to Paper" button is shown as already-added (disabled tick). */
  isAddedToPaper?: boolean;
}

export const QuestionCardRenderer: React.FC<QuestionCardRendererProps> = (props) => {
  switch (props.question.typology) {
    case 'SIMPLE_MCQ':
      return <SimpleMcqCard {...props} />;
    case 'MULTIPLE_COMPLETION_MCQ':
      return <MultipleCompletionCard {...props} />;
    case 'PASSAGE_GROUP':
      return <PassageGroupCard {...props} />;
    case 'CQ':
      return <CreativeQuestionCard {...props} />;
    case 'FILL_BLANKS':
      return <FillBlanksCard {...props} />;
    case 'MATCHING':
      return <MatchingCard {...props} />;
    case 'DESCRIPTIVE':
    case 'TARJAMA_TASHREEH':
    case 'TAHQEEQ_SIGHA':
    case 'TARKIB_IRAB':
    case 'HURUF_TAJWEED':
    default:
      return <DescriptiveCard {...props} />;
  }
};
