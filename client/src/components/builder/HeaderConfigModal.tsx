'use client';

import React, { useState } from 'react';
import { HeaderPreset, EducationStream } from 'proshno-shared';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { X, Save, Building, Sparkles, BookOpen, GraduationCap, Check } from 'lucide-react';

interface HeaderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeaderConfigModal: React.FC<HeaderConfigModalProps> = ({ isOpen, onClose }) => {
  const { headerConfig, updateHeaderConfig, layoutConfig, updateLayoutConfig } =
    usePaperCartStore();

  const [preset, setPreset] = useState<HeaderPreset>(headerConfig.headerPreset || 'NCTB');
  const [stream, setStream] = useState<EducationStream>(headerConfig.educationStream || 'GENERAL');

  const [instName, setInstName] = useState(headerConfig.institutionName);
  const [instAddress, setInstAddress] = useState(headerConfig.institutionAddress || '');
  const [examTitle, setExamTitle] = useState(headerConfig.examTitle);
  const [subject, setSubject] = useState(headerConfig.subject);
  const [subjectCode, setSubjectCode] = useState(headerConfig.subjectCode || '');
  const [grade, setGrade] = useState(headerConfig.grade || '');
  const [timeAllowed, setTimeAllowed] = useState(headerConfig.timeAllowed);
  const [totalMarks, setTotalMarks] = useState<number>(headerConfig.totalMarks || 100);

  // Qawmi Specific
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

  const [watermark, setWatermark] = useState(layoutConfig.watermarkText || '');
  const [instructions, setInstructions] = useState((headerConfig.generalInstructions || []).join('\n'));

  if (!isOpen) return null;

  const handleSelectPreset = (p: HeaderPreset) => {
    setPreset(p);
    if (p === 'QAWMI') {
      setStream('QAWMI');
      if (instName.includes('স্কুল')) {
        setInstName('মাদরাসা দারুল উলূম ও জামিয়া আরাবিয়া');
      }
      setExamTitle('মারহালা / বার্ষিক পরীক্ষা - ১৪৪৭ হি.');
      setJamat('মিশকাত জামাত');
      setKitab('শরহে বেকায়া (ফিকহ)');
      setQuestionsToAnswer(5);
      setChoiceInstruction('যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫ × ১০ = ৫০)');
    } else if (p === 'NOORANI') {
      setStream('NOORANI');
      if (instName.includes('স্কুল')) {
        setInstName("নূরানী তা'লীমুল কুরআন মাদরাসা ও মডেল মক্তব");
      }
      setExamTitle('১ম সাময়িক পরীক্ষা');
      setSubject('কুরআন মজিদ ও তাজবীদ');
      setGrade('শিশু শ্রেণি / ১ম শ্রেণি');
      setTimeAllowed('১ ঘণ্টা ৩০ মিনিট');
      setTotalMarks(50);
      setQuestionsToAnswer('');
      setChoiceInstruction('');
    } else if (p === 'NOORANI_GRID') {
      setStream('NOORANI');
      setInstName('ইক্বরা নূরানী তালিমুল কুরআন বোর্ড বাংলাদেশ');
      setExamTitle('নূরানী বার্ষিক পরীক্ষা- ২০২৬');
      setSubject('আরবী লিখা');
      setGrade('নার্সারী');
      setTimeAllowed('২ ঘণ্টা');
      setTotalMarks(100);
      setQuestionsToAnswer('');
      setChoiceInstruction('');
    } else {
      setStream('GENERAL');
      setExamTitle('অর্ধ-বার্ষিক পরীক্ষা - ২০২৬');
      setSubject('বাংলা ১ম পত্র');
      setGrade('দশম শ্রেণি');
      setQuestionsToAnswer('');
      setChoiceInstruction('');
    }
  };

  const handleSave = () => {
    updateHeaderConfig({
      headerPreset: preset,
      educationStream: stream,
      institutionName: instName,
      institutionAddress: instAddress,
      examTitle,
      subject,
      subjectCode,
      grade,
      timeAllowed,
      totalMarks: Number(totalMarks) || 100,
      bismillahText: preset === 'QAWMI' ? bismillah : undefined,
      jamat: preset === 'QAWMI' ? jamat : undefined,
      kitab: preset === 'QAWMI' ? kitab : undefined,
      nooraniBoardTitle: preset === 'NOORANI_GRID' ? instName : undefined,
      handwritingMarks: preset === 'NOORANI_GRID' ? (headerConfig.handwritingMarks || 6) : undefined,
      showScoreRubricTable: preset === 'NOORANI_GRID' ? true : undefined,
      questionsToAnswer: typeof questionsToAnswer === 'number' ? questionsToAnswer : undefined,
      choiceInstructionText: choiceInstruction.trim() || undefined,
      generalInstructions: instructions.split('\n').filter((s) => s.trim().length > 0),
    });

    updateLayoutConfig({
      watermarkText: watermark,
      columns: preset === 'NOORANI' || preset === 'NOORANI_GRID' ? 1 : layoutConfig.columns,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <span>প্রশ্নপত্রের হেডার ও প্রিসেট সেটিংস (Header Presets)</span>
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 One-Click Presets */}
        <div>
          <label className="font-semibold text-slate-700 text-xs block mb-2">
            ১-ক্লিকে হেডার প্রিসেট নির্বাচন করুন (Select Header Preset):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Preset 1: NCTB / Alia */}
            <button
              type="button"
              onClick={() => handleSelectPreset('NCTB')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                preset === 'NCTB'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                {preset === 'NCTB' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs text-slate-900">NCTB / আলিয়া বোর্ড</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  স্ট্যান্ডার্ড বোর্ড হেডার, বিষয় কোড, সময় ও মোট নম্বর
                </div>
              </div>
            </button>

            {/* Preset 2: Qawmi / Befaq */}
            <button
              type="button"
              onClick={() => handleSelectPreset('QAWMI')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                preset === 'QAWMI'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                {preset === 'QAWMI' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs text-slate-900">কওমি / বেফাক প্রথাগত</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  উপরে বিসমিল্লাহ, জামাত, কিতাব ও যেকোনো Xটি প্রশ্নের উত্তর
                </div>
              </div>
            </button>

            {/* Preset 3: Noorani Worksheet */}
            <button
              type="button"
              onClick={() => handleSelectPreset('NOORANI')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                preset === 'NOORANI'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                {preset === 'NOORANI' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs text-slate-900">নূরানী সাধারণ</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  নাম, রোল, শাখা লেখার খালি লাইন ও বড় স্পষ্ট ফন্ট
                </div>
              </div>
            </button>

            {/* Preset 4: Noorani Grid Worksheet */}
            <button
              type="button"
              onClick={() => handleSelectPreset('NOORANI_GRID')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                preset === 'NOORANI_GRID'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building className="w-4 h-4 text-emerald-700" />
                {preset === 'NOORANI_GRID' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs text-slate-900">নূরানী বক্স শিট</div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  বক্স গ্রিড, প্রাপ্ত নম্বর ছক ও হাতের লেখার নম্বর
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3.5 text-xs pt-1">
          {/* Preset specific top controls */}
          {preset === 'QAWMI' && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2.5">
              <span className="font-bold text-amber-900 block text-xs">কওমি প্রথাগত সেটিংস:</span>
              <div>
                <label className="font-medium text-slate-700 block mb-0.5">
                  শীর্ষে বিসমিল্লাহ ক্যালিগ্রাফি পাঠ:
                </label>
                <input
                  type="text"
                  value={bismillah}
                  onChange={(e) => setBismillah(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded font-ar text-sm text-center bg-white"
                  dir="rtl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-medium text-slate-700 block mb-0.5">জামাত (Class/Jamat):</label>
                  <input
                    type="text"
                    value={jamat}
                    onChange={(e) => setJamat(e.target.value)}
                    placeholder="যেমন: মিশকাত জামাত, হেদায়া"
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-0.5">কিতাব (Subject/Kitab):</label>
                  <input
                    type="text"
                    value={kitab}
                    onChange={(e) => setKitab(e.target.value)}
                    placeholder="যেমন: শরহে বেকায়া, নূরুল ঈযাহ"
                    className="w-full p-2 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
              {/* Choice logic */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="font-medium text-slate-700 block mb-0.5">
                    কতটি প্রশ্নের উত্তর দিতে হবে (যেমন: ৫):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={questionsToAnswer}
                    onChange={(e) =>
                      setQuestionsToAnswer(e.target.value ? Number(e.target.value) : '')
                    }
                    placeholder="৫"
                    className="w-full p-1.5 border border-slate-300 rounded bg-white font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-0.5">চয়েস ব্যানার টেক্সট:</label>
                  <input
                    type="text"
                    value={choiceInstruction}
                    onChange={(e) => setChoiceInstruction(e.target.value)}
                    placeholder="যেমন: যেকোনো ৫টি প্রশ্নের উত্তর দাও (৫ × ১০ = ৫০)"
                    className="w-full p-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {preset === 'NOORANI' && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
              <span className="font-bold text-blue-900 block text-xs mb-1">
                নূরানী ওয়ার্কশিট প্রিভিউ:
              </span>
              <p className="text-[11px] text-slate-600 mb-2">
                এই প্রিসেটে প্রশ্নপত্রের শীর্ষে পরীক্ষার্থীর নাম, রোল, শ্রেণি, শাখা ও তারিখ লেখার জন্য সুন্দর ফাঁকা লাইন এবং শিশুদের জন্য বড় স্পষ্ট ফন্ট স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।
              </p>
              <div className="p-2.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700 font-mono">
                নাম: ___________________ রোল: _____ শ্রেণি: {grade || 'শিশু/১ম'} শাখা: ___ তারিখ: _________
              </div>
            </div>
          )}

          {/* Standard Fields */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">শিক্ষা প্রতিষ্ঠানের নাম:</label>
            <input
              type="text"
              value={instName}
              onChange={(e) => setInstName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">ঠিকানা / শাখা:</label>
              <input
                type="text"
                value={instAddress}
                onChange={(e) => setInstAddress(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">পরীক্ষার নাম (Exam Title):</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">বিষয় (Subject):</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">শ্রেণি (Grade):</label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">সময় (Time):</label>
              <input
                type="text"
                value={timeAllowed}
                onChange={(e) => setTimeAllowed(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">পূর্ণমান (Marks):</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">জলছাপ / ওয়াটারমার্ক (ঐচ্ছিক):</label>
            <input
              type="text"
              value={watermark}
              onChange={(e) => setWatermark(e.target.value)}
              placeholder="যেমন: DRAFT, CONFIDENTIAL, প্রতিষ্ঠান নাম"
              className="w-full p-2 border border-slate-300 rounded"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              সাধারণ নির্দেশাবলি (প্রতি লাইনে একটি নির্দেশ):
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded font-mono text-[11px]"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            বাতিল
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>সংরক্ষণ ও প্রয়োগ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
