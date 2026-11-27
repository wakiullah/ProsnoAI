import { isAlimGrade, isHscGrade } from '../bangla1st/bangla1stDefaults';

export function isHscOrAlimEnglishGrade(grade?: string): boolean {
  const g = grade || '';
  return isHscGrade(g) || isAlimGrade(g) || g.includes('العالم') || g.includes('HSC') || g.includes('Alim');
}

export function isEnglish1stSubjectName(subject?: string, subjectCode?: string): boolean {
  const s = (subject || '').toLowerCase();
  const c = subjectCode || '';
  if (s.includes('2nd') || s.includes('second') || s.includes('২য়') || s.includes('২য়') || s.includes('দ্বিতীয়')) {
    return false;
  }
  return (
    s.includes('ইংরেজি ১ম') ||
    s.includes('ইংরেজি প্রথম') ||
    s.includes('english 1st') ||
    s.includes('english first') ||
    s === 'english' ||
    c === '১০৭' ||
    c === '107' ||
    c === '১৩৭' ||
    c === '137' ||
    c === '২৩৬' ||
    c === '236'
  );
}

export function isHscAlimEnglish1st(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (!isEnglish1stSubjectName(subject, subjectCode)) return false;
  if (subjectCode === '২৩৬' || subjectCode === '236') return true;
  return isHscOrAlimEnglishGrade(grade);
}

export function isSscDakhilEnglish1st(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (!isEnglish1stSubjectName(subject, subjectCode)) return false;
  if (isHscAlimEnglish1st(subject, subjectCode, grade)) return false;
  const g = grade || '';
  if (g.includes('ফাযিল') || g.includes('কামিল')) return false;
  return true;
}

export function toEnglishGradeLabel(grade?: string, stream?: string): string {
  const g = (grade || '').trim();
  const isAlia = stream === 'ALIA' || g.includes('দাখিল') || g.includes('আলিম') || g.includes('জেডিসি') || g.includes('ইবতেদায়ী') || g.includes('ইবতেদায়ী');
  if (!g) return isAlia ? 'Dakhil Class 10' : 'Class 10 (SSC)';
  if (!/[\u0980-\u09FF]/.test(g) && !/[\u0600-\u06FF]/.test(g)) return g;
  if (g.includes('আলিম') && (g.includes('২য়') || g.includes('২য়'))) return 'Alim 2nd Year';
  if (g.includes('আলিম')) return 'Alim 1st Year';
  if (g.includes('দ্বাদশ')) return 'Class 12 (HSC 2nd Year)';
  if (g.includes('একাদশ')) return 'Class 11 (HSC 1st Year)';
  if (g.includes('১০ম') || g.includes('দশম') || g.includes('এসএসসি')) {
    return isAlia ? 'Dakhil Class 10' : 'Class 10 (SSC)';
  }
  if (g.includes('৯ম') || g.includes('নবম')) return isAlia ? 'Dakhil Class 9' : 'Class 9';
  if (g.includes('৮ম') || g.includes('অষ্টম') || g.includes('জেডিসি') || g.includes('জেএসসি')) {
    return isAlia ? 'Dakhil Class 8 (JDC)' : 'Class 8';
  }
  if (g.includes('৭ম') || g.includes('সপ্তম')) return isAlia ? 'Dakhil Class 7' : 'Class 7';
  if (g.includes('৬ষ্ঠ') || g.includes('ষষ্ঠ')) return isAlia ? 'Dakhil Class 6' : 'Class 6';
  if (g.includes('৫ম')) return isAlia ? 'Ibtedayi Class 5' : 'Class 5';
  return isAlia ? 'Dakhil Class 10' : 'Class 10';
}

export function getEnglish1stInstructions(isHscAlim: boolean): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  if (isHscAlim) {
    return {
      timeAllowed: '3 hours',
      totalMarks: 100,
      generalInstructions: ['[Answer all the questions. Figures in the margin indicate full marks.]'],
    };
  }
  return {
    timeAllowed: '3 hours',
    totalMarks: 100,
    generalInstructions: ['[N.B. The figures in the right margin indicate full marks. Answer all the questions.]'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface EngMcqItem {
  id: string;
  questionText: string;
  options: [string, string, string, string];
}

export interface EngInfoTableData {
  topRows: Array<{ label: string; value: string }>;
  headers: string[];
  rows: string[][];
}

export interface EngChartItem {
  label: string;
  value: number;
}

export interface EngChartData {
  chartType: 'pie' | 'bar';
  unit: string;
  items: EngChartItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: DAKHIL / SCHOOL (CLASS 6–10) ENGLISH FIRST PAPER DEFAULTS
// ─────────────────────────────────────────────────────────────────────────────

export type SscEng1Section =
  | 'seen_1_3'
  | 'unseen_4_5'
  | 'matching_rearrange_6_7'
  | 'poems_writing_8_11';

export const SSC_ENG1_GROUP_IDS: Record<SscEng1Section, string> = {
  seen_1_3: 'eng1_seen_1_3',
  unseen_4_5: 'eng1_unseen_4_5',
  matching_rearrange_6_7: 'eng1_matching_rearrange_6_7',
  poems_writing_8_11: 'eng1_poems_writing_8_11',
};

export interface SscEng1SeenState {
  includePartABanner: boolean;
  passageInstruction: string;
  passageText: string;
  q1Instruction: string;
  q1MarksText: string;
  q1Items: EngMcqItem[];
  q2Instruction: string;
  q2MarksText: string;
  q2Items: string[];
  q3Instruction: string;
  q3MarksText: string;
  q3ClozeText: string;
}

export const DEFAULT_SSC_ENG1_SEEN: SscEng1SeenState = {
  includePartABanner: true,
  passageInstruction: 'Read the passage carefully and answer the questions no. 1, 2 and 3 :',
  passageText:
    'Humans can neither change the sun\'s radiation nor the earth\'s orbit around the sun. But they can control the increase in the amount of greenhouse gases and its effect on the atmosphere. Only during the last hundred years the carbon dioxide concentration has been raised alarmingly in the atmosphere and we humans can be held responsible for this.\nThe main cause of the increase in carbon dioxide level in the atmosphere is the burning of fossil fuels. Since the end of the 19th century, industrial activities increased rapidly giving rise to many factories. These factories required energy, which was produced through the combustion of coal.',
  q1Instruction: 'Choose the best answer from the alternatives :',
  q1MarksText: '1×7=7',
  q1Items: [
    {
      id: 'smcq_1',
      questionText: 'People destroy forests with a view to ——.',
      options: [
        'building homes and get wood',
        'building homes and getting wood',
        'reducing pollution',
        'stopping global warming',
      ],
    },
    {
      id: 'smcq_2',
      questionText: "What does the word 'combustion' mean?",
      options: ['Growing', 'Freezing', 'Burning', 'Melting'],
    },
    {
      id: 'smcq_3',
      questionText: 'Enormous areas of forest are —— every year.',
      options: ['expanded', 'damaged', 'enlarged', 'protected'],
    },
    {
      id: 'smcq_4',
      questionText: 'Which of the following plays an important role in strengthening greenhouse effect?',
      options: ['Tree plantation', 'Afforestation', 'Deforestation', 'Creation of new vegetation'],
    },
    {
      id: 'smcq_5',
      questionText: 'Man cannot avoid his responsibilities for —— alarmingly.',
      options: [
        "the sun's radiation",
        'rising carbon dioxide',
        'controlling the amount of greenhouse gases',
        'industrialization',
      ],
    },
    {
      id: 'smcq_6',
      questionText: 'The loss of enormous areas of forests —— dual problems.',
      options: ['brings about', 'bring on', 'create', 'result in'],
    },
    {
      id: 'smcq_7',
      questionText: 'What is the main purpose of the author of the passage?',
      options: [
        "To show humans' dominating power over nature",
        'To show the cause of deforestation',
        'To show industrial development all over the world',
        'To show responsibility of human beings in strengthening greenhouse effect',
      ],
    },
  ],
  q2Instruction: 'Answer the following questions :',
  q2MarksText: '2×5=10',
  q2Items: [
    'From your reading of the first paragraph, write how we are responsible for the increase of greenhouse gases.',
    'What is the main cause of the increase in carbon dioxide level in the atmosphere? Describe in brief.',
    'How much crude oil is burned daily according to the text and what is its effect on the environment?',
    'Why trees are called an "important storehouse of carbon dioxide"?',
    'What do you think we should do to keep the atmosphere normal for our living?',
  ],
  q3Instruction: 'Fill in each gap with a suitable word based on the information of the text :',
  q3MarksText: '1×5=5',
  q3ClozeText:
    "Changing the sun's radiation and the earth's orbit is (a) —— for men but they can only influence the (b) —— by increasing greenhouse gases. The main cause of (c) —— carbon dioxide level is the burning of fossil fuels such as coal, oil and natural gas. These fossil fuels are (d) —— for industrial production, producing electricity, heating our houses and above all (e) —— cars.",
};

export interface SscEng1UnseenState {
  passageInstruction: string;
  passageText: string;
  q4Instruction: string;
  q4MarksText: string;
  q4Table: EngInfoTableData;
  q5Instruction: string;
  q5Marks: number;
}

export const DEFAULT_SSC_ENG1_UNSEEN: SscEng1UnseenState = {
  passageInstruction: 'Read the passage carefully and answer the questions no. 4 and 5 :',
  passageText:
    'Mount Everest is the highest mountain in the world. It is over 29,000 feet above the sea level. It was named after George Everest, an Englishman who first surveyed the Himalayas in 1841. Sir Edmund Hillary from New Zealand and his companion Tenzing Norgay from Nepal led an expedition in 1953 and succeeded in reaching the top on May 10.',
  q4Instruction: 'Complete the table below with the information from the passage :',
  q4MarksText: '1×5=5',
  q4Table: {
    topRows: [
      { label: 'Purpose', value: 'To reach the top of Mount Everest' },
      { label: 'Starting', value: 'Hillary and Tenzing started their expedition in (i) ——' },
    ],
    headers: ['Who/What', 'Event', 'Year/When', 'Where/Place', 'Mission/How Achievement'],
    rows: [
      ['Mount Everest', '(ii) ——', '1841', 'the Himalayan Mountain', ''],
      ['Sir Edmund Hillary and Tenzing Norgay', '(iii) ——', '1953', '', '(iv) ——'],
      ['They', 'have gone down in history', '', 'in the world', '(v) ——'],
    ],
  },
  q5Instruction: 'Write a summary of the above passage in your own words.',
  q5Marks: 10,
};

export interface SscEng1MatchingState {
  instruction: string;
  marksText: string;
  hasThirdColumn: boolean;
  colA: string[];
  colB: string[];
  colC: string[];
}

export const DEFAULT_SSC_ENG1_MATCHING: SscEng1MatchingState = {
  instruction: 'Match the parts of sentences given in columns A, B and C to write five complete sentences.',
  marksText: '1×5=5',
  hasThirdColumn: true,
  colA: [
    'Education means',
    'The purpose of education',
    'Education',
    'Education',
    'Education makes us',
  ],
  colB: [
    'conscious of our rights',
    'frees a man',
    'is to enlighten',
    'aims at',
    'the receiving of formal learning',
  ],
  colC: [
    'the individual.',
    'removing the darkness.',
    'from restriction.',
    'from any educational institution.',
    'and responsibilities.',
  ],
};

export const DEFAULT_SSC_ENG1_REARRANGE = {
  instruction:
    'Put the following parts of the story in correct order to write the whole story. Only the corresponding numbers of the sentences need to be written.',
  marksText: '1×8=8',
  items: [
    'He lost his father in his boyhood.',
    'He was fond of adventures, music and jatra party.',
    'He spent his early life in great hardship.',
    'Nazrul Islam was born on the 20th May 1899.',
    'As a boy, being restless and absent minded, he did not like the hard and fast rules of the school.',
    'One day, this Dukhu Mia became a great poet.',
    'You must have heard the name of Kazi Nazrul Islam.',
    'So, he was called Dukhu Mia.',
  ],
};

export const DEFAULT_SSC_ENG1_POEMS = {
  instruction: 'Answer the following questions (any five) from the poems of your text book :',
  marksText: '2×5=10',
  items: [
    'What does the poet mean by \'useless years\' in the poem "Oh me! Oh Life!"?',
    'How are the two mothers different from each other?',
    'Why did the poet stop by the woods though it was dark and he was alone?',
    'What was the weather like when Mary went to bring the cattle home?',
    'What should children do to their mother?',
    'Why does the poet call time an old gipsy man?',
    'How has the poet described the sea?',
    'What else can the poet offer time if it stays for a day?',
  ],
};

export const DEFAULT_SSC_ENG1_STORIES = {
  instruction: 'Answer the following questions (any five) from the stories of your text book :',
  marksText: '2×5=10',
  items: [
    "Why didn't Rosamond examine the jar?",
    'Why is the rooster called Mr. Moti?',
    'Why did Rosamond persuade her mother to buy her a pair of shoes?',
    "Why did Portia's father make such a strange plan?",
    "How did the milliner's shop look like?",
    "How did Portia save Antonio's life?",
    'How many people attempted to choose the right casket? What was the result?',
    'Why did Shylock get a bond signed by Antonio?',
  ],
};

export const DEFAULT_SSC_ENG1_STORY_10 = {
  includePartBBanner: true,
  instruction:
    'Read the beginning of the story below. Add at least ten new sentences to complete it. Give a suitable title to it.',
  body:
    'Last Monday I went to bed at about 11 p.m and slept a sound sleep. Suddenly I woke up at about 2 a.m when I heard a hue and cry at a little distance. I got up from bed and saw that a cottage was burning .................... .',
  marks: 15,
};

export const DEFAULT_SSC_ENG1_WRITING_11 = {
  instruction:
    'Nowadays, the use of computer is seen everywhere in different sections. It has become very essential to learn computer. Your friend Abid/Abida has a little knowledge about it. Now, write a dialogue between you and your friend about the importance of learning computer.',
  body: '',
  marks: 15,
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: HSC & ALIM ENGLISH 1ST PAPER DEFAULTS (2026 SYLLABUS)
// ─────────────────────────────────────────────────────────────────────────────

export type HscEng1Section =
  | 'q1_passage_ab'
  | 'q2_6_reading'
  | 'q7_9_writing'
  | 'q10_11_chart_poem';

export const HSC_ENG1_GROUP_IDS: Record<HscEng1Section, string> = {
  q1_passage_ab: 'hsc_eng1_q1',
  q2_6_reading: 'hsc_eng1_q2_6',
  q7_9_writing: 'hsc_eng1_q7_9',
  q10_11_chart_poem: 'hsc_eng1_q10_11',
};

export const DEFAULT_HSC_ENG1_Q1 = {
  includePartIBanner: true,
  passageInstruction: 'Read the passage and answer the questions A and B.',
  passageText:
    "i. Adolescents constitute a nation's core resource for national renewal and growth. Adolescence is a period in life when transition from childhood to adulthood takes place and behaviours and lifestyles are shaped.\nii. The situation of adolescent girls in Bangladesh is characterised by inequality and subordination within the family and society. This inequality leads to widespread practice of child marriage, marginalisation or exclusion from health, education and economic opportunities.",
  aInstruction: 'Choose the correct answer from the alternatives.',
  aMarksText: '1 × 5 = 5',
  aItems: [
    {
      id: 'hmcq_1',
      questionText: "What could be the closest meaning of the word 'constitute' in the first sentence?",
      options: ['take', 'form', 'add', 'make'] as [string, string, string, string],
    },
    {
      id: 'hmcq_2',
      questionText: "The phrase 'leads to' in the passage refers to —.",
      options: ['results of', 'results in', 'results from', 'results to'] as [string, string, string, string],
    },
    {
      id: 'hmcq_3',
      questionText: "The word 'marginalization' refers to —.",
      options: [
        'holding a lot of power',
        'holding no power',
        'boldness in decision making',
        'having sympathy for others',
      ] as [string, string, string, string],
    },
    {
      id: 'hmcq_4',
      questionText: "The word 'widespread' mentioned in the passage means —.",
      options: ['limited', 'wide-ranging', 'narrow', 'minor'] as [string, string, string, string],
    },
    {
      id: 'hmcq_5',
      questionText: 'Adolescence is a — period from childhood to adulthood.',
      options: ['constant', 'transitional', 'rigid', 'fixed'] as [string, string, string, string],
    },
  ],
  bInstruction: 'Answer the following questions.',
  bMarksText: '2 × 5 = 10',
  bItems: [
    'What do you understand by adolescence?',
    'What is gender disparity? What are the consequences of it?',
    "Which factors are responsible for girls' early marriage?",
    'Why is adolescence an important period of life?',
    "How do wealth and education influence a girl's marriage?",
  ],
};

export const DEFAULT_HSC_ENG1_Q2 = {
  instruction: 'Read the following passage and complete the table below with the given information.',
  marksText: '1 × 10 = 10',
  passageText:
    'Shilpi was only 15 years old when she married Rashid in 2008. Marrying off daughters at an early age is a standard practice for many families living in rural Bangladesh. After her wedding, Shilpi joined a local empowerment group that provides adolescent girls with the tools needed to gradually change cultural practices.',
  table: {
    topRows: [],
    headers: ['What/Who', 'Source', 'What/Where', 'When/Why'],
    rows: [
      ['At the age of 15, Shilpi', 'was married to (i) .........', '', 'in (ii) .........'],
      ['Shilpi', 'joined', '(iii) .........', '(iv) after .........'],
      ['The local empowerment group', 'offers peer-to-peer support and (v) .........', 'that helps adolescents (vi) .........', ''],
      ['(vii) .........', 'work', 'all over Bangladesh', '(viii) to .........'],
      ['Shilpi', 'realised the potentially harmful effects', 'of (ix) .........', '(x) during .........'],
    ],
  } as EngInfoTableData,
};

export const DEFAULT_HSC_ENG1_Q3 = {
  instruction: 'Summarize the following passage.',
  passageText:
    'Education gives us knowledge and a set of abilities to function meaningfully in life, such as the ability to decide things rationally and make the right choices. As we learn how to read, write and do the basic operations of arithmetic, we gain a degree of self-confidence.',
  marks: 10,
};

export const DEFAULT_HSC_ENG1_Q4 = {
  instruction:
    'Read the following text and fill in the blanks with suitable words from the box. There are more words than needed. Make any grammatical change if necessary.',
  marksText: '0.5 × 10 = 5',
  cluesText: 'lands, farmers, easy, purpose, prepare, advantage, hand-made, dug, countries, which, fertile, industry',
  clozeText:
    'Nature has given her resources to us more generously than many other countries of the world. Think about our land. It is soft and (a) —. Our poor farmers who have simple (b) — tools can (c) — dig, plough and (d) — the soil with them. Whereas (e) — of most other countries (f) — are hard and rocky, cannot be easily (g) —. It is a great natural (h) — too. We can use most of our lands for the (i) — of agriculture and (j) —.',
};

export const DEFAULT_HSC_ENG1_Q5 = {
  instruction: 'Fill in the blanks with appropriate words in each gap.',
  marksText: '1 × 10 = 10',
  clozeText:
    'Artificial Intelligence (a) — to the intelligence of machines. This is in contrast to the natural (b) — of humans and animals. With Artificial Intelligence, (c) — perform functions such as learning, planning, reasoning and problem-solving. Most noteworthy, (d) — Intelligence is the simulation of human intelligence by machines. It is probably the fastest-growing (e) — in the world of technology and innovation. AI has the (f) — to revolutionize many industries and change the way we live and work. There are different types of AI, including narrow or weak AI, (g) — is designed to perform a specific task, and general or strong AI, which can perform any intellectual (h) — that a human being can do. Some of the potential applications of AI (i) — self-driving cars, personal assistants, and medical diagnosis. However, there is also a (j) — about the ethical implications of AI.',
};

export const DEFAULT_HSC_ENG1_Q6 = {
  instruction: 'The following sentences are jumbled. Rearrange them in proper sequence.',
  marksText: '1 × 10 = 10',
  items: [
    'Shakespeare was married at eighteen to a woman of twenty-six.',
    'There he became an actor and a playwright.',
    'But he never attended any college.',
    'By this time he was thirty.',
    'He received a sound and basic education.',
    'During the next ten years, he composed his greatest plays.',
    'William Shakespeare was born in 1564 at Stratford-upon-Avon in England.',
    'He had three children before he was twenty-one.',
    'A few years later, he went to London.',
    'He had become prosperous before he reached the age of thirty-four.',
  ],
};

export const DEFAULT_HSC_ENG1_Q7 = {
  includePartIIBanner: true,
  instruction:
    "Write a paragraph on 'Folk Music' on the basis of the answers to the following questions in about 200 words.",
  guidingQuestions:
    '(a) What is folk music? (b) What are the components of folk music? (c) Why is not folk music sophisticated? (d) Who are the contributors of folk music in Bangladesh? (e) What kind of role does folk music play in our social and cultural life?',
  marks: 10,
};

export const DEFAULT_HSC_ENG1_Q8 = {
  instruction: 'The following is the beginning of a story. Complete it in your own words.',
  body:
    'Long, long ago, there lived a shepherd boy in a certain village. He used to tend sheep in a nearby field beside the forest. The shepherd boy was a great liar. He enjoyed himself making fun with people. He often cried out "Wolf! Wolf!"....................',
  marks: 7,
};

export const DEFAULT_HSC_ENG1_Q9 = {
  instruction:
    'Suppose, you have received a birthday gift from your friend. Now, write a letter to your friend thanking him/her for the birthday gift.',
  body: '',
  marks: 5,
};

export const DEFAULT_HSC_ENG1_Q10 = {
  instruction:
    "The pie chart below shows Rima's time spending on various activities. Describe the chart in at least 80 words.",
  marks: 10,
  chartData: {
    chartType: 'pie',
    unit: '%',
    items: [
      { label: 'Sleep', value: 25 },
      { label: 'School', value: 25 },
      { label: 'Playing', value: 19 },
      { label: 'Meals', value: 6 },
      { label: 'Homework', value: 10 },
      { label: 'Entertainment', value: 15 },
    ],
  } as EngChartData,
};

export const DEFAULT_HSC_ENG1_Q11 = {
  instruction: 'Write down the theme of the following poem. (Not more than 50 words)',
  poemHeader: 'THE LAKE ISLE OF INNISFREE   ---W. B. Yeats',
  poemLines:
    'I will arise and go now, and go to Innisfree,\nAnd a small cabin build there, of clay and wattles made;\nNine bean-rows will I have there, a hive for the honey-bee\nAnd live alone in the bee-loud glade.\nAnd I shall have some peace there, for peace comes dropping slow,\nDropping from the veils of the morning to where the cricket sings;\nThere midnight\'s all a glimmer, and noon a purple glow,\nAnd evening full of the linnet\'s wings.',
  marks: 8,
};
