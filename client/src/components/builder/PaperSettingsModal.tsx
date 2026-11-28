'use client';

import React, { useState } from 'react';
import { HeaderPreset, NumberingFormat, EducationStream, ArabicFontFamily } from 'proshno-shared';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import {
  X,
  Sliders,
  Columns,
  Hash,
  Sparkles,
  Building,
  Check,
  Grid,
  FileText,
  BookmarkCheck,
  LayoutTemplate,
  BookOpen,
  GraduationCap,
  Save,
} from 'lucide-react';

interface PaperSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'header' | 'layout';
}

export const PaperSettingsModal: React.FC<PaperSettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'header',
}) => {
  const {
    headerConfig,
    layoutConfig,
    updateHeaderConfig,
    updateLayoutConfig,
    applyHeaderPreset,
    setChoiceRule,
    questions,
  } = usePaperCartStore();

  const [activeTab, setActiveTab] = useState<'header' | 'layout'>(defaultTab);

  // Form states for Header
  const [instName, setInstName] = useState(headerConfig.institutionName);
  const [instAddress, setInstAddress] = useState(headerConfig.institutionAddress || '');
  const [examTitle, setExamTitle] = useState(headerConfig.examTitle);
  const [subject, setSubject] = useState(headerConfig.subject);
  const [subjectCode, setSubjectCode] = useState(headerConfig.subjectCode || '');
  const [grade, setGrade] = useState(headerConfig.grade || '');
  const [timeAllowed, setTimeAllowed] = useState(headerConfig.timeAllowed);
  const [totalMarks, setTotalMarks] = useState<number>(headerConfig.totalMarks || 100);

  // Qawmi / Noorani specific states
  const [bismillah, setBismillah] = useState(
    headerConfig.bismillahText || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'
  );
  const [jamat, setJamat] = useState(headerConfig.jamat || 'মিশকাত জামাত');
  const [kitab, setKitab] = useState(headerConfig.kitab || 'শরহে বেকায়া');
  const [questionsToAnswer, setQuestionsToAnswer] = useState<number | ''>(
    headerConfig.questionsToAnswer !== undefined ? headerConfig.questionsToAnswer : ''
  );
  const [choiceInstruction, setChoiceInstruction] = useState(
    headerConfig.choiceInstructionText || ''
  );
  const [nooraniBoardTitle, setNooraniBoardTitle] = useState(
    headerConfig.nooraniBoardTitle || 'ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ'
  );
  const [handwritingMarks, setHandwritingMarks] = useState<number | ''>(
    headerConfig.handwritingMarks !== undefined ? headerConfig.handwritingMarks : ''
  );
  const [instructions, setInstructions] = useState(
    (headerConfig.generalInstructions || []).join('\n')
  );

  // Form states for Layout
  const [columns, setColumns] = useState<1 | 2>(layoutConfig.columns || 2);
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'large'>(
    layoutConfig.fontSize || 'standard'
  );
  const [paperSize, setPaperSize] = useState<'A4' | 'Legal'>(layoutConfig.paperSize || 'A4');
  const [numberingFormat, setNumberingFormat] = useState<NumberingFormat>(
    layoutConfig.numberingFormat || 'bn'
  );
  const [arabicFont, setArabicFont] = useState<ArabicFontFamily>(
    layoutConfig.arabicFont || 'Traditional Arabic'
  );
  const [watermark, setWatermark] = useState(layoutConfig.watermarkText || '');
  const [showMarks, setShowMarks] = useState(layoutConfig.showMarks ?? true);
  const [allowQuestionSplit, setAllowQuestionSplit] = useState(
    layoutConfig.allowQuestionSplit !== false
  );
  const [margins, setMargins] = useState(
    layoutConfig.margins || { topMm: 14, bottomMm: 14, leftMm: 18, rightMm: 18 }
  );

  if (!isOpen) return null;

  const activePreset: HeaderPreset = headerConfig.headerPreset || 'NCTB';

  const handleApplyPreset = (p: HeaderPreset) => {
    applyHeaderPreset(p);
    if (p === 'QAWMI') {
      if (instName.includes('স্কুল')) {
        setInstName('মাদরাসা দারুল উলূম ও জামিয়া আরাবিয়া');
      }
      setExamTitle('মারহালা / বার্ষিক পরীক্ষা - ১৪৪৭ হি.');
      setJamat('মিশকাত জামাত');
      setKitab('শরহে বেকায়া (ফিকহ)');
      setQuestionsToAnswer(5);
      setChoiceInstruction('যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫ × ১০ = ৫০)');
      setBismillah('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
    } else if (p === 'NOORANI') {
      if (instName.includes('স্কুল')) {
        setInstName("নূরানী তা'লীমুল কুরআন মাদরাসা ও মডেল মক্তব");
      }
      setExamTitle('১ম সাময়িক পরীক্ষা');
      setSubject('কুরআন মজিদ ও তাজবীদ');
      setGrade('শিশু শ্রেণি / ১ম শ্রেণি');
      setTimeAllowed('১ ঘণ্টা ৩০ মিনিট');
      setTotalMarks(50);
      setColumns(1);
    } else if (p === 'NOORANI_GRID') {
      setInstName('ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ');
      setExamTitle('নূরানী বার্ষিক পরীক্ষা- ২০২৬');
      setSubject('আরবী লিখা');
      setGrade('নার্সারী');
      setTimeAllowed('২ ঘণ্টা');
      setTotalMarks(100);
      setHandwritingMarks(6);
      setNooraniBoardTitle('ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ');
      setColumns(1);
    } else {
      setChoiceInstruction('');
      setQuestionsToAnswer('');
    }
  };

  const handleSaveAll = () => {
    // Save header
    const cleanInstructions = instructions
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    updateHeaderConfig({
      institutionName: instName.trim() || 'প্রতিষ্ঠানের নাম',
      institutionAddress: instAddress.trim() || undefined,
      examTitle: examTitle.trim() || 'বার্ষিক পরীক্ষা',
      subject: subject.trim() || 'বিষয়',
      subjectCode: subjectCode.trim() || undefined,
      grade: grade.trim() || undefined,
      timeAllowed: timeAllowed.trim() || '২ ঘণ্টা ৩০ মিনিট',
      totalMarks: Number(totalMarks) || 100,
      bismillahText: undefined,
      jamat: activePreset === 'QAWMI' ? jamat.trim() : undefined,
      kitab: activePreset === 'QAWMI' ? kitab.trim() : undefined,
      questionsToAnswer:
        activePreset === 'QAWMI' && typeof questionsToAnswer === 'number'
          ? questionsToAnswer
          : undefined,
      choiceInstructionText:
        activePreset === 'QAWMI' ? choiceInstruction.trim() || undefined : undefined,
      nooraniBoardTitle:
        activePreset === 'NOORANI_GRID' ? nooraniBoardTitle.trim() : undefined,
      handwritingMarks:
        typeof handwritingMarks === 'number' ? handwritingMarks : undefined,
      generalInstructions: cleanInstructions.length > 0 ? cleanInstructions : undefined,
    });

    // Save layout
    updateLayoutConfig({
      columns,
      fontSize,
      paperSize,
      numberingFormat,
      arabicFont,
      watermarkText: watermark.trim(),
      showMarks,
      allowQuestionSplit,
      margins,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[94dvh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                প্রশ্নপত্র সেটিংস (Header & Layout Settings)
              </h3>
              <p className="text-xs text-slate-500">
                হেডার, শিক্ষা ধারা প্রিসেট, কলাম ও লেআউট ফরম্যাটিং কনফিগার করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'header'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-emerald-600" />
            <span>হেডার ও বোর্ড প্রিসেট</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'layout'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutTemplate className="w-4 h-4 text-emerald-600" />
            <span>লেআউট ও পেপার ফরম্যাটিং</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs flex-1">
          {activeTab === 'header' ? (
            /* TAB 1: HEADER & PRESET */
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>শিক্ষা ধারা ও বোর্ড প্রিসেট নির্বাচন করুন:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'NCTB', label: 'সাধারণ / NCTB', sub: 'স্কুল কারিকুলাম' },
                    { id: 'QAWMI', label: 'কওমি / বেফাক', sub: 'দারুল উলূম দেওবন্দ' },
                    { id: 'NOORANI', label: 'নূরানী মক্তব', sub: 'তাজবীদ ও প্রাথমিক' },
                    { id: 'NOORANI_GRID', label: 'নূরানী বক্স শিট', sub: 'ছক ও ওয়ার্কশিট' },
                  ].map((p) => {
                    const isSelected = activePreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyPreset(p.id as HeaderPreset)}
                        className={`p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{p.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{p.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Institution Name & Address */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">প্রতিষ্ঠানের নাম:</label>
                  <input
                    type="text"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                    placeholder="যেমন: ঢাকা আইডিয়াল মডেল স্কুল অ্যান্ড কলেজ"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ঠিকানা (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={instAddress}
                    onChange={(e) => setInstAddress(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="যেমন: মতিঝিল, ঢাকা-১০০০"
                  />
                </div>
              </div>

              {/* Exam Title, Subject, Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পরীক্ষার নাম:</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="অর্ধ-বার্ষিক পরীক্ষা - ২০২৬"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বিষয়:</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="বাংলা ১ম পত্র"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">শ্রেণি / জামাত:</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="দশম শ্রেণি"
                  />
                </div>
              </div>

              {/* Time, Total Marks, Subject Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সময়:</label>
                  <input
                    type="text"
                    value={timeAllowed}
                    onChange={(e) => setTimeAllowed(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="২ ঘণ্টা ৩০ মিনিট"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পূর্ণমান (মোট নম্বর):</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value) || 0)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">বিষয় কোড (ঐচ্ছিক):</label>
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="১০১"
                  />
                </div>
              </div>

              {/* Qawmi Specific Fields */}
              {activePreset === 'QAWMI' && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <span className="font-bold text-amber-900 block text-xs">কওমি ও মাদ্রাসা বিশেষ সেটিংস:</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">কিতাবের নাম:</label>
                      <input
                        type="text"
                        value={kitab}
                        onChange={(e) => setKitab(e.target.value)}
                        className="w-full p-2 border border-amber-200 rounded-lg bg-white"
                        placeholder="শরহে বেকায়া"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">জামাত / মারহালা:</label>
                      <input
                        type="text"
                        value={jamat}
                        onChange={(e) => setJamat(e.target.value)}
                        className="w-full p-2 border border-amber-200 rounded-lg bg-white"
                        placeholder="মিশকাত জামাত"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">উত্তর দিতে হবে (চয়েস রুল):</label>
                      <input
                        type="number"
                        min="1"
                        value={questionsToAnswer}
                        onChange={(e) =>
                          setQuestionsToAnswer(e.target.value ? Number(e.target.value) : '')
                        }
                        className="w-full p-2 border border-amber-200 rounded-lg bg-white font-bold"
                        placeholder="৫"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">চয়েস নির্দেশিকা টেক্সট:</label>
                      <input
                        type="text"
                        value={choiceInstruction}
                        onChange={(e) => setChoiceInstruction(e.target.value)}
                        className="w-full p-2 border border-amber-200 rounded-lg bg-white text-xs"
                        placeholder="যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫ × ১০ = ৫০)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Noorani Grid Board Title */}
              {activePreset === 'NOORANI_GRID' && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <span className="font-bold text-blue-900 block text-xs">নূরানী বোর্ড ও রুব্রিক্স সেটিংস:</span>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">বোর্ডের নাম:</label>
                    <input
                      type="text"
                      value={nooraniBoardTitle}
                      onChange={(e) => setNooraniBoardTitle(e.target.value)}
                      className="w-full p-2 border border-blue-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">হাতের লেখার জন্য নির্ধারিত নম্বর:</label>
                    <input
                      type="number"
                      value={handwritingMarks}
                      onChange={(e) =>
                        setHandwritingMarks(e.target.value ? Number(e.target.value) : '')
                      }
                      className="w-full p-2 border border-blue-200 rounded-lg bg-white font-bold"
                      placeholder="৬"
                    />
                  </div>
                </div>
              )}

              {/* General Instructions */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  সাধারণ নির্দেশনাবলী (প্রতি লাইনে একটি নির্দেশ):
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                  placeholder="সকল প্রশ্নের মান সমান।&#10;ডান পাশের সংখ্যা প্রশ্নের পূর্ণমান নির্দেশক।"
                />
              </div>
            </div>
          ) : (
            /* TAB 2: LAYOUT & FORMATTING */
            <div className="space-y-4">
              {/* Columns */}
              <div>
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5 mb-2">
                  <Columns className="w-4 h-4 text-emerald-600" />
                  <span>কলাম বিন্যাস (Column Layout):</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setColumns(1)}
                    className={`p-3 rounded-xl border text-left transition ${
                      columns === 1
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">১-কলাম লেআউট (Single Column)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ছোট প্রশ্নপত্র, নূরানী ওয়ার্কশিট, বা প্রাথমিক শ্রেণির জন্য উপযোগী
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setColumns(2)}
                    className={`p-3 rounded-xl border text-left transition ${
                      columns === 2
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">২-কলাম লেআউট (Standard Board Layout)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      NCTB বোর্ড ও স্কুল পরীক্ষার স্ট্যান্ডার্ড দুই কলাম ফরম্যাট
                    </div>
                  </button>
                </div>
              </div>

              {/* Smart Question Flow / Keep Together */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-1.5">
                  কলাম / পেজ বিভাজন (Smart Flow):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAllowQuestionSplit(true)}
                    className={`p-3 rounded-xl border text-left transition ${
                      allowQuestionSplit
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">স্বয়ংক্রিয় ফ্লো (ডিফল্ট)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      কলামে যতটুকু সাব-প্রশ্ন ধরবে ততটুকু বসিয়ে বাকিগুলো পরের কলাম/পেজে যাবে
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllowQuestionSplit(false)}
                    className={`p-3 rounded-xl border text-left transition ${
                      !allowQuestionSplit
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">সম্পূর্ণ প্রশ্ন একসাথে রাখুন</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      কোনো প্রশ্ন না ভেঙে পুরোটাই পরের কলাম বা পেজে স্থানান্তর করবে
                    </div>
                  </button>
                </div>
              </div>

              {/* Font Size & Paper Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">ফন্ট সাইজ (Font Size):</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'compact', label: 'ছোট (9pt)' },
                      { id: 'standard', label: 'স্ট্যান্ডার্ড (10.5pt)' },
                      { id: 'large', label: 'বড় (12pt)' },
                    ].map((fs) => (
                      <button
                        key={fs.id}
                        type="button"
                        onClick={() => setFontSize(fs.id as any)}
                        className={`p-2 rounded-xl border text-center transition font-semibold text-xs ${
                          fontSize === fs.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {fs.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">কাগজের সাইজ (Paper Size):</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['A4', 'Legal'].map((ps) => (
                      <button
                        key={ps}
                        type="button"
                        onClick={() => setPaperSize(ps as any)}
                        className={`p-2 rounded-xl border text-center transition font-semibold text-xs ${
                          paperSize === ps
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {ps} ({ps === 'A4' ? 'স্ট্যান্ডার্ড' : 'লম্বা শিট'})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Numbering Format */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-1.5">
                  প্রশ্ন নম্বরের লিপি (Numbering Script):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bn', label: 'বাংলা সংখ্যা (১, ২, ৩)' },
                    { id: 'en', label: 'English (1, 2, 3)' },
                    { id: 'ar', label: 'Arabic (١, ٢, ٣)' },
                  ].map((nf) => (
                    <button
                      key={nf.id}
                      type="button"
                      onClick={() => setNumberingFormat(nf.id as any)}
                      className={`p-2 rounded-xl border text-center transition font-semibold text-xs ${
                        numberingFormat === nf.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {nf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Arabic Typography Font (Traditional Arabic, Noto Naskh Arabic, Lateef) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 text-xs flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>আরবি ফন্ট নির্বাচন (Arabic Typography Font):</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                    আরবি ১ম ও ২য় পত্র
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  আরবি প্রথম পত্র ও দ্বিতীয় পত্রের জন্য তিনটি ক্লাসিক্যাল ফন্ট। পুরো প্রশ্নপত্র ও প্রিন্টে নির্বাচিত ফন্টটি সরাসরি কাজ করবে:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: 'Traditional Arabic',
                      label: 'ট্র্যাডিশনাল অ্যারাবিক',
                      desc: 'Traditional Arabic (বোর্ড ও টেক্সটবুক স্ট্যান্ডার্ড)',
                      sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    },
                    {
                      id: 'Noto Naskh Arabic',
                      label: 'নটো নাকশ অ্যারাবিক',
                      desc: 'Noto Naskh (স্পষ্ট হরকত ও ক্যালিগ্রাফি)',
                      sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    },
                    {
                      id: 'Lateef',
                      label: 'লতিফ',
                      desc: 'Lateef (নমনীয় ও মার্জিত নাসখ হরফ)',
                      sample: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setArabicFont(f.id as any)}
                      className={`p-2.5 rounded-xl border text-right transition flex flex-col justify-between ${
                        arabicFont === f.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                          {f.id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{f.label}</span>
                      </div>
                      <div
                        dir="rtl"
                        style={{ fontFamily: f.id }}
                        className="text-base text-emerald-900 my-1 font-normal select-none"
                      >
                        {f.sample}
                      </div>
                      <div className="text-[10px] text-slate-500 text-left mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Margins */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block mb-1.5">
                  পৃষ্ঠার মার্জিন (Margins in mm):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">উপরে (Top):</label>
                    <input
                      type="number"
                      value={margins.topMm}
                      onChange={(e) =>
                        setMargins({ ...margins, topMm: Number(e.target.value) || 10 })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">নিচে (Bottom):</label>
                    <input
                      type="number"
                      value={margins.bottomMm}
                      onChange={(e) =>
                        setMargins({ ...margins, bottomMm: Number(e.target.value) || 10 })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">বামে (Left):</label>
                    <input
                      type="number"
                      value={margins.leftMm}
                      onChange={(e) =>
                        setMargins({ ...margins, leftMm: Number(e.target.value) || 10 })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">ডানে (Right):</label>
                    <input
                      type="number"
                      value={margins.rightMm}
                      onChange={(e) =>
                        setMargins({ ...margins, rightMm: Number(e.target.value) || 10 })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Watermark & Marks toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    জলছাপ / Watermark (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={watermark}
                    onChange={(e) => setWatermark(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 text-xs"
                    placeholder="যেমন: গোপনীয় / CONFIDENTIAL"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={showMarks}
                      onChange={(e) => setShowMarks(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>প্রশ্নের ডানপাশে নম্বর (মান) প্রদর্শন করুন</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>সংরক্ষণ ও পরিবর্তন প্রয়োগ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
