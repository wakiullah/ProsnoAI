'use client';

import React, { useState } from 'react';
import { EducationStream, HeaderPreset, InstitutionHeaderConfig } from 'proshno-shared';
import {
  GraduationCap,
  BookOpen,
  Building,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Clock,
  Layers,
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
  }) => void;
}

export const MADRASAH_CLASSES = [
  { id: 'ebtedayi_5', label: '৫ম শ্রেণি (ইবতেদায়ী ৫ম)', group: 'ইবতেদায়ী' },
  { id: 'class_6', label: '৬ষ্ঠ শ্রেণি', group: 'দাখিল' },
  { id: 'class_7', label: '৭ম শ্রেণি', group: 'দাখিল' },
  { id: 'class_8', label: '৮ম শ্রেণি (জেডিসি)', group: 'দাখিল' },
  { id: 'dakhil_9', label: 'দাখিল ৯ম শ্রেণি', group: 'দাখিল' },
  { id: 'dakhil_10', label: 'দাখিল ১০ম শ্রেণি (দাখিল পরীক্ষা)', group: 'দাখিল' },
  { id: 'alim_1', label: 'আলিম ১ম বর্ষ', group: 'আলিম' },
  { id: 'alim_2', label: 'আলিম ২য় বর্ষ (আলিম পরীক্ষা)', group: 'আলিম' },
  { id: 'fazil', label: 'ফাযিল (স্নাতক ১ম/২য়/৩য় বর্ষ)', group: 'উচ্চতর' },
  { id: 'kamil', label: 'কামিল (মাস্টার্স)', group: 'উচ্চতর' },
];

export const SCHOOL_CLASSES = [
  { id: 'sch_5', label: '৫ম শ্রেণি (প্রাথমিক)' },
  { id: 'sch_6', label: '৬ষ্ঠ শ্রেণি' },
  { id: 'sch_7', label: '৭ম শ্রেণি' },
  { id: 'sch_8', label: '৮ম শ্রেণি (জেএসসি)' },
  { id: 'sch_9', label: '৯ম শ্রেণি' },
  { id: 'sch_10', label: '১০ম শ্রেণি (এসএসসি)' },
  { id: 'sch_11', label: 'একাদশ শ্রেণি (এইচএসসি ১ম বর্ষ)' },
  { id: 'sch_12', label: 'দ্বাদশ শ্রেণি (এইচএসসি ২য় বর্ষ)' },
];

export const QAWMI_CLASSES = [
  { id: 'q_rawda', label: 'রওজাতুল আতফাল / শিশু শ্রেণি' },
  { id: 'q_ibtedayi', label: 'মারহালাতুল ইবতিদায়্যাহ (১ম-৫ম)' },
  { id: 'q_mutawassita', label: 'মারহালাতুল মুতাওয়াসসিতাহ (নাহবেমীর)' },
  { id: 'q_sanabia_amma', label: 'সানাবিয়া আম্মাহ (কাফিয়া/শরহে বেকায়া)' },
  { id: 'q_sanabia_khasa', label: 'সানাবিয়া খাসসাহ (জালালাইন/হিদায়া)' },
  { id: 'q_fazilat', label: 'ফযীলত (মিশকাত জামাত)' },
  { id: 'q_dawra', label: 'তাকমীল / দাওরায়ে হাদিস (মাস্টার্স সমমান)' },
];

export const MADRASAH_SUBJECTS = [
  {
    name: 'আরবি ১ম পত্র (আল-লুগাতুল আরাবিয়্যাতুল ইত্তেসালিয়্যাহ)',
    code: '১৩৩',
    isPrimary: true,
    desc: 'নসর, নজম, আল-হিবার ও আরবি কথোপকথন',
  },
  {
    name: 'আরবি ২য় পত্র (কাওয়াইদুল লুগাতিল আরাবিয়্যাহ)',
    code: '১৩৪',
    isPrimary: true,
    desc: 'ইলমুন নাহু, ইলমুস সরফ ও রচনা/দরখাস্ত',
  },
  {
    name: 'আল কুরআন মাজিদ ও তাজবীদ',
    code: '১০১',
    desc: 'সূরা নির্বাচন, অর্থ, ব্যাখ্যা ও তাজবীদের নিয়ম',
  },
  {
    name: 'হাদিস শরিফ ও ফিকহ',
    code: '১০২',
    desc: 'হাদিস এবারত, অনুবাদ ও মাসআলা-মাসায়েল',
  },
  {
    name: 'ইসলামের ইতিহাস',
    code: '১০৯',
    desc: 'খোলাফায়ে রাশেদীন ও উমাইয়া-আব্বাসীয় খিলাফত',
  },
  {
    name: 'বালাঘাত ও মানতিক',
    code: '১১৮',
    desc: 'আলিম শ্রেণির অলংকারশাস্ত্র ও যুক্তিবিদ্যা',
  },
  {
    name: 'বাংলা ১ম পত্র',
    code: '১৩৫',
    desc: 'সাহিত্য সঞ্চয়ন ও সহপাঠ',
  },
  {
    name: 'ইংরেজি ১ম পত্র',
    code: '১৩৬',
    desc: 'English for Today (Madrasah Board)',
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
  const [grade, setGrade] = useState('الصف العاشر من الداخل');
  const [subject, setSubject] = useState('اللغة العربية الإتصالية');
  const [subjectCode, setSubjectCode] = useState('১৩৩');
  const [institutionName, setInstitutionName] = useState('بهيربهيري عالم مدرسة - تاكورغاو');
  const [examTitle, setExamTitle] = useState('الإمتحان التَّأهيلي - ٢٠٢٦');
  const [timeAllowed, setTimeAllowed] = useState('ثلاث ساعات');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [bismillahText, setBismillahText] = useState('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');

  if (!isOpen) return null;

  const handleStreamSelect = (s: EducationStream) => {
    setStream(s);
    if (s === 'ALIA') {
      setInstitutionName('بهيربهيري عالم مدرسة - تاكورغاو');
      setGrade('الصف العاشر من الداخل');
      setSubject('اللغة العربية الإتصالية');
      setSubjectCode('১৩৩');
      setExamTitle('الإمتحان التَّأهيلي - ٢٠٢٦');
      setTimeAllowed('ثلاث ساعات');
      setTotalMarks(100);
      setBismillahText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    } else if (s === 'GENERAL') {
      setInstitutionName('ঢাকা আইডিয়াল মডেল স্কুল অ্যান্ড কলেজ');
      setGrade('৯ম শ্রেণি');
      setSubject('বাংলা ১ম পত্র');
      setSubjectCode('১০১');
      setBismillahText('');
    } else if (s === 'QAWMI') {
      setInstitutionName('আল-জামিয়া আল-ইসলামিয়া দারুল উলুম');
      setGrade('সানাবিয়া খাসসাহ (জালালাইন/হিদায়া)');
      setSubject('শরহে বেকায়া / কানযুদ দাকায়িক');
      setSubjectCode('');
      setBismillahText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    }
  };

  const isSubjectSelected = (sub: { name: string; code?: string }) => {
    // 1. Match by subjectCode if available
    if (sub.code && subjectCode) {
      return sub.code === subjectCode;
    }
    // 2. Direct name match
    if (subject === sub.name) return true;

    // 3. Precise Arabic paper matches
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
    const is1st = !is2nd && (subjName.includes('আরবি ১ম') || subjName.includes('الإتصالية') || code === '১৩৩');

    if (is1st) {
      setInstitutionName('بهيربهيري عالم مدرسة - تاكورغاو');
      setExamTitle('الإمتحان التَّأهيلي - ٢٠٢٦');
      setSubject('اللغة العربية الإتصالية');
      setSubjectCode('১৩৩');
      setTimeAllowed('ثلاث ساعات');
      setTotalMarks(100);
      setBismillahText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
      if (grade.includes('১০ম') || grade.includes('দশম') || grade.includes('العاشر')) {
        setGrade('الصف العاشر من الداخل');
      } else if (grade.includes('৯ম') || grade.includes('নবম') || grade.includes('التاسع')) {
        setGrade('الصف التاسع من الداخل');
      }
    } else if (is2nd) {
      setInstitutionName('بهيربهيري عالم مدرسة - تاكورغاو');
      setExamTitle('الإمتحان التَّأهيلي - ٢٠٢٦');
      setSubject('قواعد اللغة العربية');
      setSubjectCode('১৩৪');
      setTimeAllowed('ثلاث ساعات');
      setTotalMarks(100);
      setBismillahText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
      if (grade.includes('১০ম') || grade.includes('দশম') || grade.includes('العاشر')) {
        setGrade('الصف العاشر من الداخل');
      } else if (grade.includes('৯ম') || grade.includes('নবম') || grade.includes('التاسع')) {
        setGrade('الصف التاسع من الداخل');
      }
    }
  };

  const handleFinish = () => {
    onComplete({
      stream,
      grade,
      subject,
      subjectCode,
      institutionName,
      examTitle,
      timeAllowed,
      totalMarks,
      bismillahText: bismillahText.trim() || undefined,
    });
    onClose();
  };

  const classList =
    stream === 'ALIA'
      ? MADRASAH_CLASSES
      : stream === 'QAWMI'
      ? QAWMI_CLASSES
      : SCHOOL_CLASSES;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-4 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-emerald-200 shadow-inner">
              <Sparkles className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                নতুন প্রশ্নপত্র সেটআপ উইজার্ড
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                কোন পরীক্ষার জন্য প্রশ্নপত্র তৈরি করবেন?
              </h2>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 mt-5 text-xs font-semibold">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                step === 1 ? 'bg-white text-emerald-900 shadow' : 'bg-white/20 text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ১
              </span>
              <span>শিক্ষা ধারা</span>
            </div>
            <div className="h-0.5 w-6 bg-white/30" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                step === 2 ? 'bg-white text-emerald-900 shadow' : 'bg-white/20 text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ২
              </span>
              <span>শ্রেণি ও মারহালা</span>
            </div>
            <div className="h-0.5 w-6 bg-white/30" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition ${
                step === 3 ? 'bg-white text-emerald-900 shadow' : 'bg-white/20 text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ৩
              </span>
              <span>বিষয় ও হেডার তথ্য</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ───────────────── STEP 1: STREAM SELECTION ───────────────── */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div className="text-center sm:text-left">
                <h3 className="text-base font-bold text-slate-900">
                  ১. পরীক্ষার শিক্ষাধারা নির্বাচন করুন:
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  আমরা মাদ্রাসা ও আরবি প্রশ্নপত্রের বোর্ড কাঠামোকে সম্পূর্ণ প্রাধান্য দিয়ে প্রস্তুত করেছি।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* Madrasah Card */}
                <button
                  type="button"
                  onClick={() => handleStreamSelect('ALIA')}
                  className={`p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                    stream === 'ALIA'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  {stream === 'ALIA' && (
                    <span className="absolute top-3 right-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 font-bold text-sm">
                    مدرسه
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">মাদ্রাসা (আলিয়া)</div>
                    <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                      বাংলাদেশ মাদ্রাসা শিক্ষাবোর্ড
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      দাখিল ও আলিম স্তরের আরবি ১ম, আরবি ২য়, কুরআন, হাদিস ও ফিকহ বোর্ড ফরম্যাট।
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded font-bold w-fit">
                    ★ সর্বাধিক ব্যবহৃত
                  </div>
                </button>

                {/* School Card */}
                <button
                  type="button"
                  onClick={() => handleStreamSelect('GENERAL')}
                  className={`p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                    stream === 'GENERAL'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  {stream === 'GENERAL' && (
                    <span className="absolute top-3 right-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3 font-bold text-sm">
                    NCTB
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">সাধারণ স্কুল ও কলেজ</div>
                    <div className="text-xs font-semibold text-blue-700 mt-0.5">
                      জাতীয় শিক্ষাক্রম (NCTB)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      এসএসসি ও এইচএসসি স্তরের সৃজনশীল (CQ), বহুনির্বাচনী ও বোর্ড স্ট্যান্ডার্ড।
                    </p>
                  </div>
                </button>

                {/* Qawmi Card */}
                <button
                  type="button"
                  onClick={() => handleStreamSelect('QAWMI')}
                  className={`p-4 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                    stream === 'QAWMI'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  {stream === 'QAWMI' && (
                    <span className="absolute top-3 right-3 text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                    </span>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3 font-bold text-sm">
                    وفاق
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900">কওমি মাদ্রাসা (বেফাক)</div>
                    <div className="text-xs font-semibold text-purple-700 mt-0.5">
                      বেফাকুল মাদারিসিল আরাবিয়া
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      মিশকাত, শরহে বেকায়া, তারকীব, এরাব ও দরসি কিতাবের ঐতিহ্যবাহী প্রশ্নধারা।
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ───────────────── STEP 2: CLASS SELECTION ───────────────── */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  <span>২. শ্রেণি বা মারহালা নির্বাচন করুন ({stream === 'ALIA' ? 'মাদ্রাসা ধারা' : stream}):</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নিচের তালিকা থেকে আপনার কাঙ্ক্ষিত শ্রেণিটি পছন্দ করুন।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {classList.map((c) => {
                  const isSelected = grade === c.label;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setGrade(c.label)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isSelected ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-xs sm:text-sm">{c.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───────────────── STEP 3: SUBJECT & HEADER PRESETS ───────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>৩. বিষয় ও প্রাতিষ্ঠানিক হেডার তথ্য:</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  আরবি প্রথম ও দ্বিতীয় পত্রের বিশেষায়িত প্রশ্ন কাঠামোর সাথে অন্যান্য বিষয় সমর্থিত।
                </p>
              </div>

              {/* Subject Pill Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  বিষয় পছন্দ করুন (নির্বাচিত শ্রেণি: {grade}):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MADRASAH_SUBJECTS.map((sub, idx) => {
                    const isSelected = isSubjectSelected(sub);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSubjectSelect(sub.name, sub.code)}
                        className={`p-3 rounded-xl border text-left transition relative ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-xs text-slate-900 font-medium'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold flex items-center gap-1.5">
                            {sub.name}
                            {sub.isPrimary && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded font-mono font-bold">
                                ফোকাস
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {sub.code && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                কোড: {sub.code}
                              </span>
                            )}
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{sub.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Institution Meta Details */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3.5">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>প্রশ্নপত্রের হেডার টেক্সট (পেপারে পরে সরাসরি এডিটও করতে পারবেন):</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">
                      মাদ্রাসার / প্রতিষ্ঠানের নাম:
                    </label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                      placeholder="যেমন: দারুন্নাজাত সিদ্দিকিয়া কামিল মাদ্রাসা"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">পরীক্ষার নাম:</label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                      placeholder="যেমন: অর্ধ-বার্ষিক পরীক্ষা - ২০২৬"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">সময়:</label>
                    <input
                      type="text"
                      value={timeAllowed}
                      onChange={(e) => setTimeAllowed(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                      placeholder="যেমন: ২ ঘণ্টা ৩০ মিনিট"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">পূর্ণমান:</label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(Number(e.target.value) || 100)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  {stream !== 'GENERAL' && (
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 font-semibold block mb-1">
                        বিসমিল্লাহ টেক্সট (শীর্ষে প্রদর্শিত):
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={bismillahText}
                        onChange={(e) => setBismillahText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 font-serif text-sm font-bold text-center"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>পূর্ববর্তী ধাপ</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400">ধাপ ১ / ৩</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition"
              >
                <span>পরবর্তী ধাপ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-300 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>প্রশ্নপত্র ক্যানভাসে প্রবেশ করুন</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
