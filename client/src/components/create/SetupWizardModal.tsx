'use client';

import React, { useState, useEffect } from 'react';
import { EducationStream } from 'proshno-shared';
import {
  BanglaPaperMode,
  getBanglaInstructionsByMode,
  isAlimGrade,
  isBangla1stPaper,
} from './bangla1st/bangla1stDefaults';
import {
  getBangla2ndInstructions,
  isBangla2ndPaper,
  isHscOrAlimGrade,
} from './bangla2nd/bangla2ndDefaults';
import {
  GraduationCap,
  BookOpen,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: {
    stream: EducationStream;
    grade: string;
    subject: string;
    subjectCode?: string;
    institutionName: string;
    examTitle: string;
    timeAllowed: string;
    totalMarks: number;
    bismillahText?: string;
    banglaPaperMode?: BanglaPaperMode;
    setCode?: string;
  }) => void;
}

export const MADRASAH_CLASSES = [
  { id: 'ebtedayi_5', label: '৫ম শ্রেণি (ইবতেদায়ী)', shortLabel: 'ইবতেদায়ী ৫ম' },
  { id: 'class_6', label: '৬ষ্ঠ শ্রেণি', shortLabel: 'দাখিল ৬ষ্ঠ শ্রেণি' },
  { id: 'class_7', label: '৭ম শ্রেণি', shortLabel: 'দাখিল ৭ম শ্রেণি' },
  { id: 'class_8', label: '৮ম শ্রেণি (জেডিসি)', shortLabel: 'দাখিল ৮ম শ্রেণি' },
  { id: 'dakhil_9', label: 'দাখিল ৯ম শ্রেণি', shortLabel: 'দাখিল ৯ম শ্রেণি' },
  { id: 'dakhil_10', label: 'দাখিল ১০ম শ্রেণি (দাখিল পরীক্ষা)', shortLabel: 'দাখিল ১০ম শ্রেণি' },
  { id: 'alim_1', label: 'আলিম ১ম বর্ষ', shortLabel: 'আলিম ১ম বর্ষ' },
  { id: 'alim_2', label: 'আলিম ২য় বর্ষ (আলিম পরীক্ষা)', shortLabel: 'আলিম ২য় বর্ষ' },
  { id: 'fazil', label: 'ফাযিল (স্নাতক ১ম/২য়/৩য় বর্ষ)', shortLabel: 'ফাযিল (স্নাতক)' },
  { id: 'kamil', label: 'কামিল (মাস্টার্স)', shortLabel: 'কামিল (মাস্টার্স)' },
];

export const SCHOOL_CLASSES = [
  { id: 'sch_5', label: '৫ম শ্রেণি (প্রাথমিক)', shortLabel: '৫ম শ্রেণি' },
  { id: 'sch_6', label: '৬ষ্ঠ শ্রেণি', shortLabel: '৬ষ্ঠ শ্রেণি' },
  { id: 'sch_7', label: '৭ম শ্রেণি', shortLabel: '৭ম শ্রেণি' },
  { id: 'sch_8', label: '৮ম শ্রেণি (জেএসসি)', shortLabel: '৮ম শ্রেণি' },
  { id: 'sch_9', label: '৯ম শ্রেণি', shortLabel: '৯ম শ্রেণি' },
  { id: 'sch_10', label: '১০ম শ্রেণি (এসএসসি)', shortLabel: '১০ম শ্রেণি (SSC)' },
  { id: 'sch_11', label: 'একাদশ শ্রেণি (এইচএসসি ১ম বর্ষ)', shortLabel: 'একাদশ (HSC ১ম)' },
  { id: 'sch_12', label: 'দ্বাদশ শ্রেণি (এইচএসসি ২য় বর্ষ)', shortLabel: 'দ্বাদশ (HSC ২য়)' },
];

export const QAWMI_CLASSES = [
  { id: 'q_rawda', label: 'রওজাতুল আতফাল / শিশু শ্রেণি', shortLabel: 'রওজাতুল আতফাল' },
  { id: 'q_ibtedayi', label: 'মারহালাতুল ইবতিদায়্যাহ (১ম-৫ম)', shortLabel: 'ইবতিদায়্যাহ' },
  { id: 'q_mutawassita', label: 'মারহালাতুল মুতাওয়াসসিতাহ (নাহবেমীর)', shortLabel: 'মুতাওয়াসসিতাহ' },
  { id: 'q_sanabia_amma', label: 'সানাবিয়া আম্মাহ (কাফিয়া/শরহে বেকায়া)', shortLabel: 'সানাবিয়া আম্মাহ' },
  { id: 'q_sanabia_khasa', label: 'সানাবিয়া খাসসাহ (জালালাইন/হিদায়া)', shortLabel: 'সানাবিয়া খাসসাহ' },
  { id: 'q_fazilat', label: 'ফযীলত (মিশকাত জামাত)', shortLabel: 'ফযীলত (মিশকাত)' },
  { id: 'q_dawra', label: 'তাকমীল / দাওরায়ে হাদিস (মাস্টার্স সমমান)', shortLabel: 'দাওরায়ে হাদিস' },
];

export const MADRASAH_SUBJECTS = [
  {
    name: 'আরবি ১ম পত্র (আল-লুগাতুল আরাবিয়্যাতুল ইত্তেসালিয়্যাহ)',
    shortName: 'আরবি ১ম পত্র',
    code: '১৩৩',
    desc: 'নসর, নজম ও আল-হিবার',
  },
  {
    name: 'আরবি ২য় পত্র (কাওয়াইদুল লুগাতিল আরাবিয়্যাহ)',
    shortName: 'আরবি ২য় পত্র',
    code: '১৩৪',
    desc: 'সরফ, নাহু, অনুবাদ ও রচনা',
  },
  {
    name: 'বাংলা ১ম পত্র',
    shortName: 'বাংলা ১ম পত্র',
    code: '১৩৫',
    desc: 'বহুনির্বাচনি ৩০ + সৃজনশীল ৭০',
  },
  {
    name: 'বাংলা ২য় পত্র',
    shortName: 'বাংলা ২য় পত্র',
    code: '১৩৬',
    desc: 'ব্যাকরণ ও নির্মিতি (৩০ + ৭০ = ১০০)',
  },
  {
    name: 'ইংরেজি ১ম পত্র',
    shortName: 'ইংরেজি ১ম পত্র',
    code: '১৩৭',
    desc: 'English for Today',
  },
  {
    name: 'আল কুরআন মাজিদ ও তাজবীদ',
    shortName: 'কুরআন মাজিদ ও তাজবীদ',
    code: '১০১',
    desc: 'সূরা, অনুবাদ ও তাজবীদ',
  },
  {
    name: 'হাদিস শরিফ ও ফিকহ',
    shortName: 'হাদিস শরিফ ও ফিকহ',
    code: '১০২',
    desc: 'হাদিস ও মাসআলা-মাসায়েল',
  },
  {
    name: 'ইসলামের ইতিহাস',
    shortName: 'ইসলামের ইতিহাস',
    code: '১০৯',
    desc: 'খিলাফত ও ইসলামের ইতিহাস',
  },
  {
    name: 'বালাঘাত ও মানতিক',
    shortName: 'বালাঘাত ও মানতিক',
    code: '১১৮',
    desc: 'অলংকারশাস্ত্র ও যুক্তিবিদ্যা',
  },
];

export const SCHOOL_SUBJECTS = [
  {
    name: 'বাংলা ১ম পত্র',
    shortName: 'বাংলা ১ম পত্র',
    code: '১০১',
    desc: 'বহুনির্বাচনি ৩০ + সৃজনশীল ৭০',
  },
  {
    name: 'বাংলা ২য় পত্র',
    shortName: 'বাংলা ২য় পত্র',
    code: '১০২',
    desc: 'বাংলা ব্যাকরণ ও নির্মিতি',
  },
  {
    name: 'ইংরেজি ১ম পত্র',
    shortName: 'ইংরেজি ১ম পত্র',
    code: '১০৭',
    desc: 'English for Today (NCTB)',
  },
  {
    name: 'গণিত',
    shortName: 'গণিত',
    code: '১০৯',
    desc: 'বীজগণিত, জ্যামিতি ও ত্রিকোণমিতি',
  },
  {
    name: 'ইসলাম ও নৈতিক শিক্ষা',
    shortName: 'ইসলাম ও নৈতিক শিক্ষা',
    code: '১১১',
    desc: 'আকাইদ, কুরআন ও হাদিস',
  },
  {
    name: 'বাংলাদেশ ও বিশ্বপরিচয়',
    shortName: 'বাংলাদেশ ও বিশ্বপরিচয়',
    code: '১৫০',
    desc: 'ইতিহাস, সমাজ ও নাগরিকতা',
  },
  {
    name: 'পদার্থবিজ্ঞান',
    shortName: 'পদার্থবিজ্ঞান',
    code: '১৩৬',
    desc: 'বলবিদ্যা, তাপ, আলো ও তড়িৎ',
  },
  {
    name: 'রসায়ন',
    shortName: 'রসায়ন',
    code: '১৩৭',
    desc: 'পদার্থের গঠন ও রাসায়নিক বিক্রিয়া',
  },
];

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [stream, setStream] = useState<EducationStream>('ALIA');
  const [grade, setGrade] = useState('দাখিল ১০ম শ্রেণি (দাখিল পরীক্ষা)');
  const [subject, setSubject] = useState('اللغة العربية الإتصالية');
  const [subjectCode, setSubjectCode] = useState('১৩৩');
  const [institutionName, setInstitutionName] = useState('بهيربهيري عالم مدرسة - تاكورغاو');
  const [examTitle, setExamTitle] = useState('الإمتحان التَّأهيلي - ٢٠٢٦');
  const [timeAllowed, setTimeAllowed] = useState('ثلاث ساعات');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [banglaPaperMode, setBanglaPaperMode] = useState<BanglaPaperMode>('COMBINED_100');

  // Always start at Step 1 (Education Stream selection) whenever wizard opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStreamSelect = (s: EducationStream, autoAdvance = true) => {
    setStream(s);
    if (s === 'ALIA') {
      setInstitutionName('بهيربهيري عالم مدرسة - تاكورغاو');
      setGrade('দাখিল ১০ম শ্রেণি (দাখিল পরীক্ষা)');
      setSubject('اللغة العربية الإتصالية');
      setSubjectCode('১৩৩');
      setExamTitle('الإمتحان التَّأهيلي - ٢٠٢٦');
      setTimeAllowed('ثلاث ساعات');
      setTotalMarks(100);
    } else if (s === 'GENERAL') {
      setInstitutionName('নোয়াখালী জিলা স্কুল');
      setGrade('১০ম শ্রেণি (এসএসসি)');
      setSubject('বাংলা ১ম পত্র');
      setSubjectCode('১০১');
      setExamTitle('বার্ষিক / নির্বাচনি পরীক্ষা - ২০২৬');
      const meta = getBanglaInstructionsByMode(banglaPaperMode, '১০ম শ্রেণি (এসএসসি)');
      setTimeAllowed(meta.timeAllowed);
      setTotalMarks(meta.totalMarks);
    } else if (s === 'QAWMI') {
      setInstitutionName('আল-জামিয়া আল-ইসলামিয়া দারুল উলুম');
      setGrade('সানাবিয়া খাসসাহ (জালালাইন/হিদায়া)');
      setSubject('শরহে বেকায়া / কানযুদ দাকায়িক');
      setSubjectCode('');
      setExamTitle('বার্ষিক পরীক্ষা - ১৪৪৭ হি.');
      setTimeAllowed('৩ ঘণ্টা');
      setTotalMarks(100);
    }
    if (autoAdvance) {
      setStep(2);
    }
  };

  const isSubjectSelected = (sub: { name: string; code?: string }) => {
    if (sub.code && subjectCode) {
      return sub.code === subjectCode;
    }
    if (subject === sub.name) return true;

    if (sub.code === '১৩৩' || sub.name.includes('আরবি ১ম')) {
      return (
        subject === 'اللغة العربية الإتصالية' ||
        (subject.includes('الإتصالية') && !subject.includes('قواعد')) ||
        (subject.includes('আরবি ১ম') && !subject.includes('২য়'))
      );
    }
    if (sub.code === '১৩৪' || sub.name.includes('আরবি ২য়')) {
      return (
        subject === 'قواعد اللغة العربية' ||
        subject.includes('قواعد') ||
        subject.includes('আরবি ২য়') ||
        subject.includes('কাওয়াইদুল')
      );
    }
    return false;
  };

  const handleSubjectSelect = (subjName: string, code?: string) => {
    setSubject(subjName);
    if (code) setSubjectCode(code);

    const is2nd = subjName.includes('আরবি ২য়') || subjName.includes('কাওয়াইদুল') || code === '১৩৪';
    const is1st =
      !is2nd && (subjName.includes('আরবি ১ম') || subjName.includes('الإتصالية') || code === '১৩৩');

    if (is1st) {
      setInstitutionName('بهيربهيري عالم مدرسة - تاكورغاو');
      setExamTitle('الإمتحان التَّأهيلي - ٢٠٢٦');
      setSubject('اللغة العربية الإتصالية');
      setSubjectCode('১৩৩');
      setTimeAllowed('ثلاث ساعات');
      setTotalMarks(100);
    } else if (is2nd) {
      setInstitutionName('بهيربهيري عالم مدرسة - تاكورغاو');
      setExamTitle('الإمتحان التَّأهيلي - ٢٠٢٦');
      setSubject('قواعد اللغة العربية');
      setSubjectCode('১৩৪');
      setTimeAllowed('ثلاث ساعات');
      setTotalMarks(100);
    } else if (isBangla1stPaper(subjName, code)) {
      const modeMeta = getBanglaInstructionsByMode(banglaPaperMode, grade);
      setTimeAllowed(modeMeta.timeAllowed);
      setTotalMarks(modeMeta.totalMarks);
      if (stream === 'ALIA') {
        setInstitutionName('দারুন্নাজাত সিদ্দিকিয়া কামিল মাদ্রাসা');
        setExamTitle('অর্ধ-বার্ষিক / প্রাক-নির্বাচনি পরীক্ষা - ২০২৬');
        if (grade.includes('العاشر')) setGrade('দাখিল ১০ম শ্রেণি (দাখিল পরীক্ষা)');
        else if (grade.includes('التاسع')) setGrade('দাখিল ৯ম শ্রেণি');
      } else {
        setInstitutionName('নোয়াখালী জিলা স্কুল');
        setExamTitle('বার্ষিক / নির্বাচনি পরীক্ষা - ২০২৬');
      }
    } else if (isBangla2ndPaper(subjName, code)) {
      const modeMeta = getBangla2ndInstructions(banglaPaperMode, grade);
      setTimeAllowed(modeMeta.timeAllowed);
      setTotalMarks(modeMeta.totalMarks);
      if (stream === 'ALIA') {
        setInstitutionName('দারুন্নাজাত সিদ্দিকিয়া কামিল মাদ্রাসা');
        setExamTitle('অর্ধ-বার্ষিক / প্রাক-নির্বাচনি পরীক্ষা - ২০২৬');
        if (grade.includes('العاشر')) setGrade('দাখিল ১০ম শ্রেণি (দাখিল পরীক্ষা)');
        else if (grade.includes('التاسع')) setGrade('দাখিল ৯ম শ্রেণি');
      } else {
        setInstitutionName('ঢাকা আইডিয়াল মডেল স্কুল অ্যান্ড কলেজ');
        setExamTitle('বার্ষিক / নির্বাচনি পরীক্ষা - ২০২৬');
      }
    } else {
      if (stream === 'ALIA' && !/[\u0980-\u09FF]/.test(institutionName)) {
        setInstitutionName('দারুন্নাজাত সিদ্দিকিয়া কামিল মাদ্রাসা');
        setExamTitle('অর্ধ-বার্ষিক পরীক্ষা - ২০২৬');
        setTimeAllowed('৩ ঘণ্টা');
      }
    }
  };

  const handleBanglaModeSelect = (mode: BanglaPaperMode) => {
    setBanglaPaperMode(mode);
    const isB2 = isBangla2ndPaper(subject, subjectCode);
    const meta = isB2
      ? getBangla2ndInstructions(mode, grade)
      : getBanglaInstructionsByMode(mode, grade);
    setTimeAllowed(meta.timeAllowed);
    setTotalMarks(meta.totalMarks);
  };

  const handleFinish = () => {
    const isBangla =
      isBangla1stPaper(subject, subjectCode) ||
      isBangla2ndPaper(subject, subjectCode);
    const isAr2nd =
      subject.includes('আরবি ২য়') ||
      subject.includes('قواعد') ||
      subject.includes('কাওয়াইদুল') ||
      subjectCode === '১৩৪';
    const isAr1st =
      !isAr2nd &&
      (subject.includes('আরবি ১ম') ||
        subject.includes('الإتصالية') ||
        subject.includes('اللغة العربية') ||
        subjectCode === '১৩৩');

    let finalGrade = grade;
    if (isAr1st || isAr2nd) {
      if (grade.includes('১০ম') || grade.includes('দশম')) {
        finalGrade = 'الصف العاشر من الداخل';
      } else if (grade.includes('৯ম') || grade.includes('নবম')) {
        finalGrade = 'الصف التاسع من الداخل';
      }
    }

    onComplete({
      stream,
      grade: finalGrade,
      subject,
      subjectCode,
      institutionName,
      examTitle,
      timeAllowed,
      totalMarks,
      bismillahText: undefined,
      banglaPaperMode: isBangla ? banglaPaperMode : undefined,
    });
    onClose();
  };

  const classList =
    stream === 'ALIA'
      ? MADRASAH_CLASSES
      : stream === 'QAWMI'
      ? QAWMI_CLASSES
      : SCHOOL_CLASSES;

  const streamLabel =
    stream === 'ALIA' ? 'মাদ্রাসা (আলিয়া)' : stream === 'GENERAL' ? 'স্কুল ও কলেজ' : 'কওমি মাদ্রাসা';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        {/* Compact Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/15 flex items-center justify-center text-emerald-200 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                  নতুন প্রশ্নপত্র সেটআপ উইজার্ড
                </h2>
                <p className="text-[11px] text-emerald-200 truncate">
                  শিক্ষা ধারা, শ্রেণি ও বিষয় নির্বাচন করে দ্রুত শুরু করুন
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition shrink-0"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Clickable 3-Step Segmented Bar */}
          <div className="grid grid-cols-3 gap-1.5 mt-3">
            {[
              { id: 1 as const, label: '১. শিক্ষা ধারা' },
              { id: 2 as const, label: '২. শ্রেণি' },
              { id: 3 as const, label: '৩. বিষয় ও হেডার' },
            ].map((st) => {
              const isActive = step === st.id;
              const isDone = step > st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStep(st.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-extrabold flex items-center justify-center gap-1 transition ${
                    isActive
                      ? 'bg-white text-emerald-900 shadow-xs'
                      : isDone
                      ? 'bg-emerald-700/70 text-emerald-100 hover:bg-emerald-700'
                      : 'bg-white/15 text-white/85 hover:bg-white/25'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />}
                  <span className="truncate">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* ───────────────── STEP 1: STREAM SELECTION (1-Tap Auto-Advance) ───────────────── */}
          {step === 1 && (
            <div className="space-y-2.5 animate-in fade-in-50 duration-150">
              <p className="text-xs font-bold text-slate-600">
                ১. কোন শিক্ষা ধারার প্রশ্নপত্র তৈরি করবেন ট্যাপ করুন:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'ALIA' as EducationStream,
                    badge: 'مدرسه',
                    badgeCls: 'bg-emerald-100 text-emerald-800',
                    title: 'মাদ্রাসা (আলিয়া)',
                    sub: 'মাদ্রাসা শিক্ষাবোর্ড (দাখিল ও আলিম)',
                    desc: 'আরবি ১ম, আরবি ২য়, বাংলা, কুরআন ও হাদিস',
                  },
                  {
                    id: 'GENERAL' as EducationStream,
                    badge: 'NCTB',
                    badgeCls: 'bg-blue-100 text-blue-800',
                    title: 'স্কুল ও কলেজ',
                    sub: 'সাধারণ শিক্ষা বোর্ড (৬ষ্ঠ–দ্বাদশ)',
                    desc: 'বাংলা ১ম পত্র, ইংরেজি, গণিত ও বিজ্ঞান',
                  },
                  {
                    id: 'QAWMI' as EducationStream,
                    badge: 'وفاق',
                    badgeCls: 'bg-purple-100 text-purple-800',
                    title: 'কওমি মাদ্রাসা',
                    sub: 'বেফাকুল মাদারিসিল আরাবিয়া',
                    desc: 'কিতাব বিভাগ, তারকীব, এরাব ও দরসি প্রশ্ন',
                  },
                ].map((item) => {
                  const active = stream === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleStreamSelect(item.id, true)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition flex sm:flex-col items-center sm:items-start justify-between gap-3 active:scale-[0.99] ${
                        active
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${item.badgeCls}`}
                        >
                          {item.badge}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-sm text-slate-900">{item.title}</div>
                          <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                            {item.sub}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 sm:hidden shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───────────────── STEP 2: CLASS SELECTION (2-Column Compact Grid + 1-Tap Advance) ───────────────── */}
          {step === 2 && (
            <div className="space-y-2.5 animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>২. শ্রেণি নির্বাচন করুন ({streamLabel}):</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  ধারা পরিবর্তন
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {classList.map((c) => {
                  const isSelected =
                    grade === c.label ||
                    (c.id === 'dakhil_10' && grade.includes('العاشر')) ||
                    (c.id === 'dakhil_9' && grade.includes('التاسع'));
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setGrade(c.label);
                        setStep(3);
                      }}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition active:scale-95 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-extrabold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800 font-semibold'
                      }`}
                    >
                      <span className="text-xs truncate">{c.shortLabel || c.label}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 ml-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───────────────── STEP 3: SUBJECT & HEADER PRESETS ───────────────── */}
          {step === 3 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-150">
              {/* Selected Stream & Class Quick Context Bar */}
              <div className="flex items-center justify-between bg-slate-100/80 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 truncate">
                  <span className="text-emerald-800">{streamLabel}</span>
                  <span className="text-slate-400">•</span>
                  <span className="truncate">{grade}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-[11px] font-extrabold text-emerald-700 hover:underline shrink-0 ml-2"
                >
                  শ্রেণি বদলান
                </button>
              </div>

              {/* Compact 2-Column Subject Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>বিষয় নির্বাচন করুন:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {(stream === 'GENERAL' ? SCHOOL_SUBJECTS : MADRASAH_SUBJECTS).map((sub, idx) => {
                    const isSelected = isSubjectSelected(sub);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSubjectSelect(sub.name, sub.code)}
                        className={`p-2.5 rounded-xl border text-left transition active:scale-[0.98] ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/80 ring-1 ring-emerald-500 text-slate-900'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-extrabold truncate">
                            {sub.shortName || sub.name}
                          </span>
                          {sub.code && (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-700 text-white font-bold'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {sub.code}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bangla 1st & 2nd Paper Special Configuration */}
              {(isBangla1stPaper(subject, subjectCode) ||
                (isBangla2ndPaper(subject, subjectCode) && !isHscOrAlimGrade(grade))) && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl space-y-2.5">
                  <div className="text-[11px] font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">
                      {isBangla2ndPaper(subject, subjectCode)
                        ? 'বাংলা ২য় পত্র পরীক্ষার ধরন (৬ষ্ঠ–১০ম শ্রেণি ও দাখিল: ব্যাকরণ MCQ ৩০ + নির্মিতি ৭০):'
                        : `পরীক্ষার ধরন (${isAlimGrade(grade) ? 'আলিম: গদ্য ও কবিতা' : 'গদ্য, কবিতা, উপন্যাস ও নাটক'}):`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      {
                        id: 'COMBINED_100' as BanglaPaperMode,
                        title: 'একত্রে ১০০',
                        sub: isBangla2ndPaper(subject, subjectCode)
                          ? 'MCQ ৩০ + রচনামূলক ৭০'
                          : 'MCQ ৩০ + CQ ৭০',
                      },
                      {
                        id: 'MCQ_ONLY_30' as BanglaPaperMode,
                        title: 'শুধু MCQ ৩০',
                        sub: '৩০টি প্রশ্ন · ৩০ মি.',
                      },
                      {
                        id: 'CQ_ONLY_70' as BanglaPaperMode,
                        title: isBangla2ndPaper(subject, subjectCode)
                          ? 'শুধু রচনামূলক ৭০'
                          : 'শুধু CQ ৭০',
                        sub: isBangla2ndPaper(subject, subjectCode)
                          ? '১–৬ নং প্রশ্ন · ২:৩০ ঘ.'
                          : '৭টি সৃজনশীল · ২:৩০ ঘ.',
                      },
                    ].map((m) => {
                      const active = banglaPaperMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleBanglaModeSelect(m.id)}
                          className={`p-2 rounded-xl border text-center transition ${
                            active
                              ? 'bg-emerald-700 border-emerald-800 text-white shadow-2xs'
                              : 'bg-white border-emerald-200 text-slate-700 hover:bg-emerald-100/50'
                          }`}
                        >
                          <div className="text-[11px] sm:text-xs font-extrabold">{m.title}</div>
                          <div
                            className={`text-[9px] sm:text-[10px] mt-0.5 truncate ${
                              active ? 'text-emerald-100' : 'text-slate-500'
                            }`}
                          >
                            {m.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isBangla2ndPaper(subject, subjectCode) && isHscOrAlimGrade(grade) && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-3 rounded-2xl text-xs text-indigo-950 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-700" />
                    <span>বাংলা ২য় পত্র (এইচএসসি ও আলিম বোর্ড কাঠামো — পূর্ণমান ১০০):</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    • <b>ব্যাকরণ অংশ (৩০ নম্বর)</b>: ১ থেকে ৬ নং প্রশ্ন (প্রতিটির মান ০৫) এবং <b>নির্মিতি অংশ (৭০ নম্বর)</b>: ৭ থেকে ১২ নং প্রশ্ন (১০×৫ + ২০ = ৭০)।
                  </p>
                </div>
              )}

              {/* Compact Institution Meta Details */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2.5">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" />
                  <span>হেডার তথ্য (পেপারে ক্লিক করে পরেও এডিট করা যাবে):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                      প্রতিষ্ঠানের নাম:
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-emerald-500 outline-none font-medium text-xs"
                      placeholder="মাদ্রাসা বা স্কুলের নাম"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                      পরীক্ষার নাম:
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-emerald-500 outline-none font-medium text-xs"
                      placeholder="অর্ধ-বার্ষিক পরীক্ষা - ২০২৬"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                        সময়:
                      </label>
                      <input
                        type="text"
                        value={timeAllowed}
                        onChange={(e) => setTimeAllowed(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-emerald-500 outline-none font-medium text-xs"
                        placeholder="৩ ঘণ্টা"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-1">
                        পূর্ণমান:
                      </label>
                      <input
                        type="number"
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(Number(e.target.value) || 100)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:border-emerald-500 outline-none font-medium text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-5 flex items-center justify-between gap-2 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1 px-3 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>পূর্ববর্তী</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400">ধাপ ১ / ৩</span>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <span>পরবর্তী ধাপ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold rounded-xl shadow-md shadow-emerald-200 transition active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>প্রশ্নপত্র ক্যানভাসে প্রবেশ করুন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
