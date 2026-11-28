import { isHscOrAlimEnglishGrade } from '../english1st/english1stDefaults';

export function isEnglish2ndSubjectName(subject?: string, subjectCode?: string): boolean {
  const s = (subject || '').toLowerCase();
  const c = subjectCode || '';
  if (s.includes('1st') || s.includes('first') || s.includes('১ম') || s.includes('প্রথম')) {
    return false;
  }
  return (
    s.includes('ইংরেজি ২য়') ||
    s.includes('ইংরেজি ২য়') ||
    s.includes('ইংরেজি দ্বিতীয়') ||
    s.includes('ইংরেজি দ্বিতীয়') ||
    s.includes('english 2nd') ||
    s.includes('english second') ||
    c === '১০৮' ||
    c === '108' ||
    c === '১৩৮' ||
    c === '138' ||
    c === '২৩৯' ||
    c === '239'
  );
}

export function isHscAlimEnglish2nd(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (!isEnglish2ndSubjectName(subject, subjectCode)) return false;
  if (subjectCode === '২৩৯' || subjectCode === '239') return true;
  return isHscOrAlimEnglishGrade(grade);
}

export function isSscDakhilEnglish2nd(
  subject?: string,
  subjectCode?: string,
  grade?: string
): boolean {
  if (!isEnglish2ndSubjectName(subject, subjectCode)) return false;
  if (isHscAlimEnglish2nd(subject, subjectCode, grade)) return false;
  const g = grade || '';
  if (g.includes('ফাযিল') || g.includes('কামিল')) return false;
  return true;
}

export function getEnglish2ndInstructions(): {
  timeAllowed: string;
  totalMarks: number;
  generalInstructions: string[];
} {
  return {
    timeAllowed: '3 hours',
    totalMarks: 100,
    generalInstructions: ['[N.B. The figures in the right margin indicate full marks.]'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DATA INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface Eng2SubstitutionTableData {
  colLeft: string[]; // 5 subjects (a)-(e)
  colMiddleVerbs: string[]; // merged middle column verbs e.g. ['are', 'is', 'can']
  colRight: string[]; // 5 predicates
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 1: SCHOOL & DAKHIL (CLASS 6–10) ENGLISH SECOND PAPER (4 GROUPED MODALS)
// ─────────────────────────────────────────────────────────────────────────────

export type SscEng2Section = 'q1_3_grammar' | 'q4_5_grammar' | 'q6_9_grammar' | 'q10_12_writing';

export const SSC_ENG2_GROUP_IDS: Record<SscEng2Section, string> = {
  q1_3_grammar: 'eng2_q1_3',
  q4_5_grammar: 'eng2_q4_5',
  q6_9_grammar: 'eng2_q6_9',
  q10_12_writing: 'eng2_q10_12',
};

export const DEFAULT_SSC_ENG2_Q1_3 = {
  includePartABanner: true,
  q1Instruction:
    'Fill in the blanks with the words from the box. You may need to change the forms of the words. You may need to use one word more than once.',
  q1MarksText: '1×10=10',
  q1Clues: 'undermine, enhance, universal, conscious, strong, bring, journey, pressing, fulfillment, foster',
  q1Text:
    'Happiness is often seen as a (a) _____ goal in human life, yet its definition varies across cultures and individuals. While material success may (b) _____ a sense of satisfaction, studies show that it does not guarantee lasting (c) _____. Genuine happiness stems from meaningful relationships, personal growth, and a (d) _____ sense of purpose. Practicing gratitude and mindfulness can also (e) _____ emotional well-being. In contrast, chronic stress and social isolation (f) _____ happiness and mental health. Governments and workplaces should (g) _____ environments that support psychological wellness. In an increasingly fast-paced world, making time for self-care has become a (h) _____ necessity. Ultimately, cultivating happiness is a lifelong (i) _____ that requires balance, awareness, and (j) _____ effort.',
  q2Instruction:
    'Make five sentences using the parts of sentences from each column of the table below.',
  q2MarksText: '1×5=5',
  q2Table: {
    colLeft: ['Cyber security', 'It', 'Cyber-attacks', 'Organizations', 'Individuals'],
    colMiddleVerbs: ['are', 'is', 'can'],
    colRight: [
      'a critical issue as more personal and business activities move online.',
      'investing heavily in security measures to safeguard their information.',
      'important for protecting computer systems from theft or damage.',
      'also taking steps to protect themselves, such as using strong passwords.',
      'lead to data breaches, financial loss, and identity theft.',
    ],
  } as Eng2SubstitutionTableData,
  q3Instruction:
    'Complete the following text with the right forms of verbs given in the box. You can use one verb more than once.',
  q3MarksText: '1×10=10',
  q3Clues: 'be, decline, launch, spend, provide, seem, take, become, see, establish',
  q3Text:
    'In recent years, digital addiction (a) _____ a growing concern for educators and psychologists. Many young people (b) _____ excessive time on screens without realizing its impact. Their social skills and real-life interactions (c) _____ significantly. As screen time increases, attention spans (d) _____ to decrease. Parents often (e) _____ unsure about how to handle this issue. Although some apps (f) _____ time limits, they are rarely effective. Schools also (g) _____ initiatives to reduce screen dependency. If we (h) _____ this seriously, the mental health of the next generation will (i) _____ at stake. We must (j) _____ a healthy balance between digital life and reality.',
};

export const DEFAULT_SSC_ENG2_Q4_5 = {
  q4Instruction: 'Change the sentences according to directions given in the brackets.',
  q4MarksText: '1×10=10',
  q4Items: [
    'Is there anybody who does not want to succeed in life? (Make it assertive)',
    'It is a difficult thing. (Make it negative)',
    'An industrious man will shine in life. (Make it complex)',
    'We must work hard so that we can prosper in life. (Make it simple)',
    'Life with an assignment is an actual life. (Make it negative)',
    'No one can receive any reward unless he works hard. (Make it simple)',
    "One can't be successful without it. (Make it interrogative)",
    'A successful man is very happy. (Make it exclamatory)',
    'A lazy man is not only unhappy but also unhealthy. (Make it compound)',
    'A hardworking man is not in bad health. (Make it affirmative)',
  ],
  q5Instruction: 'Make tag questions of the following statements.',
  q5MarksText: '1×5=5',
  q5Items: [
    "She isn't attending the extra class this weekend, _____ ?",
    'You study French at the language center on weekends, _____ ?',
    'The math exam we had yesterday was quite challenging, _____ ?',
    'He should review his notes before the final exam, _____ ?',
    "We've already completed the group project for science class, _____ ?",
  ],
};

export const DEFAULT_SSC_ENG2_Q6_9 = {
  q6Instruction:
    'Complete the text by adding suffixes, prefixes or both with the root words given in the parentheses.',
  q6MarksText: '1×5=5',
  q6Text:
    'Pottery is one of the oldest forms of artistic (a) _____ (express) in human history. It requires great skill and (b) _____ (patient) to shape and fire clay into usable or decorative items. Potters must be both creative and (c) _____ (practice) to succeed. In many cultures, pottery plays a (d) _____ (tradition) role, often passed down through generations. Despite the rise of industrial production, handmade pottery remains (e) _____ (value) for its uniqueness and beauty.',
  q7Instruction: 'Fill in the blanks with suitable prepositions:',
  q7MarksText: '1×5=5',
  q7Text:
    'A good stock (a) _____ words is necessary for anybody who wants to use a language. Vocabulary is an essential component (b) _____ successful communication. It is an integral part of reading skill. While grammar is important, a lack (c) _____ vocabulary may result (d) _____ complete failure (e) _____ conveying a message.',
  q8Instruction: 'Complete the passage using suitable connectors or linking words.',
  q8MarksText: '1×5=5',
  q8Text:
    '(a) _____ flood is considered to be a natural calamity, it is no doubt a blessing for the people to some extent. It is considered to be a blessing in the sense (b) _____ it makes the soil alluvial. (c) _____, silt is scattered over the land, (d) _____ makes the soil fertile. (e) _____, it can be said that floods have both constructive and destructive sides.',
  q9Instruction: 'Use capitals and punctuation marks where necessary in the following text.',
  q9MarksText: '5',
  q9Text:
    'hello is this the fire station yes it is. please come quickly. Theres a fire in our kitchen, said Mrs. Rahman calmly.',
};

export const DEFAULT_SSC_ENG2_Q10_12 = {
  includePartBBanner: true,
  q10Instruction: "Write a paragraph on 'The Life of a Rickshaw Puller'.",
  q10Body: '',
  q10Marks: 10,
  q11Instruction:
    'Suppose you are Fahim/Fahima from Dhaka, Bangladesh. Now, write an email to your friend in Feni, inviting him/her to visit a historical place in Dhaka during the winter vacation.',
  q11Body: '',
  q11Marks: 10,
  q12Instruction: "Write a composition on 'Uses and Abuses of Internet'.",
  q12Body: '',
  q12Marks: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 2: HSC & ALIM ENGLISH SECOND PAPER (4 GROUPED MODALS — Q. 1–16)
// ─────────────────────────────────────────────────────────────────────────────

export type HscEng2Section = 'q1_4_grammar' | 'q5_8_grammar' | 'q9_12_grammar' | 'q13_16_comp';

export const HSC_ENG2_GROUP_IDS: Record<HscEng2Section, string> = {
  q1_4_grammar: 'hsc_eng2_q1_4',
  q5_8_grammar: 'hsc_eng2_q5_8',
  q9_12_grammar: 'hsc_eng2_q9_12',
  q13_16_comp: 'hsc_eng2_q13_16',
};

export const DEFAULT_HSC_ENG2_Q1_4 = {
  includePartABanner: true,
  q1Instruction: 'Use articles where necessary. Put a cross (×) where an article is not needed :',
  q1MarksText: '0.5×10=5',
  q1Text:
    'Truthfulness is (a) —— greatest of all virtues. It makes (b) —— man really great. If we do not cultivate (c) —— habit of speaking (d) —— truth, we cannot command (e) —— confidence of others. (f) —— man whom nobody believes can never be famous in (g) —— life. It may be that we may succeed once or twice by telling (h) —— lie, but it never brings into a good result. (i) —— lie never lies hidden. Today or tomorrow it comes to light. Then (j) —— real character of the liar is revealed and nobody believes him.',
  q2Instruction: 'Fill in the gaps with appropriate prepositions :',
  q2MarksText: '0.5×10=5',
  q2Text:
    'At daylight I was half wakened by the sound (a) —— chopping. Again it was so even (b) —— texture that I went back (c) —— sleep. When I left my bed (d) —— the cool morning, the boy had come and gone, and a stack (e) —— kindling was neat (f) —— the cabin wall. He came after school (g) —— the afternoon and worked until time (h) —— return (i) —— the orphanage. His name was Jerry. He had been (j) —— the orphanage since he was four.',
  q3Instruction: 'Complete the sentences with suitable phrases/words given in the box:',
  q3MarksText: '0.5×10=5',
  q3Clues: "Was born, have to/has to, would rather, had better, let alone, What's it like, as soon as, as if, there, it",
  q3Items: [
    'The old man can not walk one mile —— five miles.',
    'William Shakespeare, the greatest dramatist of English literature —— in London.',
    'Life is not a bed of roses. You —— prepare yourself to face many challenges.',
    'Rakib is a very honest man. He —— starve than adopt the path of dishonesty.',
    '—— has been raining since morning. How will you go to office?',
    'Students should stand up —— the teacher enters into the classroom.',
    'I have never swum in the sea. —— swimming in the sea?',
    'The weather is getting stormy. You —— go home as early as possible.',
    'He talked —— he had seen something supernatural.',
    '—— was no Govt. primary school in our village.',
  ],
  q4Instruction: 'Complete the following sentences with suitable conditionals, phrases or clauses :',
  q4MarksText: '0.5×10=5',
  q4Items: [
    'I have an emergency visit to Dhaka. If I were a bird ——.',
    'He likes to read science fiction. He went to the book fair with a view to ——.',
    '—— I would have helped the poor.',
    'He is not good at English. He is trying his best so that ——.',
    'Every student should utilize their time properly. There goes the proverb that ——.',
    'She is too weak to ——. She has been suffering from Dengue fever.',
    'Never be impatient. You should continue study ——.',
    'He is a poor man. He lives from ——.',
    'I am very thirsty. Would you mind ——.',
    'It was long since ——. So, I did not expect that he would recognise me at first glance.',
  ],
};

export const DEFAULT_HSC_ENG2_Q5_8 = {
  q5Instruction: 'Read the following text and fill in the blanks with correct form of verbs :',
  q5MarksText: '0.5×10=5',
  q5Text:
    "Man cannot survive without water on earth. It is (a) —— (say) that the other name of water is life. The United Nations has (b) —— (identify) the drinking water problem as one of the challenges for future. In Bangladesh, one of the sources of water (c) —— (be) the rivers. Rivers (d) —— (be) everywhere in our life and culture. But the rivers aren't in good shape. A few are already (e) —— (die) and several are (f) —— (go) through the pangs of death. The river Buriganga is an example of a dying river. Its water is (g) —— (pollute) and a perpetual stench fills the air around it. But the river (h) —— (have) a glorious past. It (i) —— (supply) drinking water and (j) —— (support) trade and commerce.",
  q6Instruction: 'Read the text and change the sentences as directed :',
  q6MarksText: '1×5=5',
  q6Items: [
    'Moral character is the most precious virtue in human life. (Comparative)',
    'A man who is lawful never fears anyone. (Simple)',
    'Inspite of his poverty, Mr. Rahman is an honest man. (Complex)',
    'An honest man is respected by everyone. (Active)',
    'Nobody likes a dishonest man. (Interrogative)',
  ],
  q7Instruction: 'Rewrite the following sentences in the reported speech :',
  q7MarksText: '5',
  q7Text:
    '"Have you ever been to Kuakata?" asked Rakib, "No, I have never gone there," replied Nayem. "But I long for visiting the place." "I have had an opportunity to visit the sea-beach last year," said Rakib. "How charming the scenery is!"',
  q8Instruction:
    'Identify the unclear pronoun references in the following paragraph. Where necessary re-write the sentences so that all pronoun references are clear.',
  q8MarksText: '1×5=5',
  q8Text:
    'Once there lived a good King in Scotland. His name was Robert Bruce. He loved his country and his subjects very dearly. They had a great love for him. One day his enemies attacked his country. The King fought bravely but lost the battle. To save his life he took shelter in a remote cave. Once he was lying in a cave. Then it saw a spider trying hard to reach the ceiling of the cave. If failed again and again to succeed. But it did not give up hope. It saw the spider climbing to the ceiling after some unsuccessful attempts. This dauntless spider inspired Bruce. He gathered an army of strong men and attacked his enemies. He were defeated and Robert Bruce regained his Kingdom.',
};

export const DEFAULT_HSC_ENG2_Q9_12 = {
  q9Instruction: 'Read the following text and use modifiers as directed in the blank spaces :',
  q9MarksText: '0.5×10=5',
  q9Text:
    'Many people all over the world die (a) —— (post modify the verb) because of pollution. These unfortunate and (b) —— (pre-modify the noun) deaths are caused by environmental pollution. Environmental pollution refers to (c) —— (pre-modify the adjective) specific pollution. Firstly, air is polluted by domestic waste and (d) —— (pre-modify the noun) waste. It mainly causes (e) —— (pre-modify the noun) disease. Then we pollute water (f) —— (post-modify the verb) by throwing waste into it. Water pollution causes many (g) —— (pre-modify the noun) diseases. Next factor is noise pollution (h) —— (post-modify the noun with a present participle) aggression and damaging hearing. And finally, odour pollution from dumped or untreated (i) —— (pre-modify the noun with a noun adjective) waste which causes discomfort to our sense of smell. We should take action (j) —— (post-modify the noun with an infinitive) these problems.',
  q10Instruction: 'Use appropriate sentence connectors in the blank spaces of the following passage :',
  q10MarksText: '0.5×10=5',
  q10Text:
    'Education is essential in our life. (a) —— we are not properly educated, we cannot live an honourable life in society. It teaches us (b) —— how to earn but also how to spend (c) ——. It teaches (d) —— to live in amity with others in society. (e) —— we must get proper education. (f) —— we should bear in mind (g) —— education is not only what we learn of educational institutions. (h) ——, we can learn outside of these institutions. (i) —— is a lifelong process. It begins just after our birth (j) —— ends only with death.',
  q11Instruction:
    'Read the passage and then write the synonym or antonym of the words as directed.',
  q11MarksText: '0.5×10=5',
  q11Passage:
    'Art is <u>generally</u> understood as an <u>expression</u> of human <u>imagination</u> and <u>creative</u> skills. It includes painting, drawing, <u>sculpture</u> and architecture. The aim of art is to <u>evoke</u> feelings and <u>emotions</u> that are considered aesthetic. Through the world people <u>appreciate</u> art for its <u>power</u> to <u>affect</u> them in creative ways.',
  q11Items: [
    'generally (synonym)',
    'expression (synonym)',
    'imagination (antonym)',
    'creative (synonym)',
    'sculpture (synonym)',
    'emotion (synonym)',
    'appreciate (antonym)',
    'affect (synonym)',
    'evoke (antonym)',
    'power (synonym)',
  ],
  q12Instruction:
    'There are ten errors in the use of punctuation marks and capitalization in the following text. Re-write the text correcting the errors.',
  q12MarksText: '0.5×10=5',
  q12Text:
    'I came here yesterday from my village he said why did you come i asked my mother sent me to you with this letter',
};

export const DEFAULT_HSC_ENG2_Q13_16 = {
  includePartBBanner: true,
  q13Instruction:
    "Suppose, you are a student of Madrasah-e-Alia, Dhaka. Students can't practise English speaking as there is no English Language Club in your Madrasah. Now, write an application to the Principal of your Madrasah for an English Language Club.",
  q13Marks: 8,
  q14Instruction:
    'Suppose, you are a reporter of a national daily. You have witnessed a serious road accident. Now, write a report on it.',
  q14Marks: 8,
  q15Instruction: "Write a paragraph on 'Artificial Intelligence'.",
  q15Marks: 10,
  q16Instruction:
    "Write a short composition on, 'Unemployment Problem in Bangladesh'. (within 200—250 words).",
  q16Marks: 14,
};
