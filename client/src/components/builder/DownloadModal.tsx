'use client';

import React, { useState } from 'react';
import {
  Download,
  X,
  FileText,
  CheckCircle2,
  Grid,
  Shuffle,
  Layers,
  RefreshCw,
  Check,
} from 'lucide-react';

export type DeliverableType = 'question-paper' | 'answer-key' | 'omr-sheet';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliverableType: DeliverableType;
  availableSets: string[];
  activeSet?: string;
  onDownloadSet: (setName: string, type?: DeliverableType) => Promise<void>;
  onDownloadAllSets: (setNames: string[], type?: DeliverableType) => Promise<void>;
  onOpenSetShuffler: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  deliverableType,
  availableSets,
  activeSet,
  onDownloadSet,
  onDownloadAllSets,
  onOpenSetShuffler,
}) => {
  const [selectedType, setSelectedType] = useState<DeliverableType>(deliverableType);
  const [downloadingSet, setDownloadingSet] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [progressText, setProgressText] = useState('');

  React.useEffect(() => {
    setSelectedType(deliverableType);
  }, [deliverableType]);

  if (!isOpen) return null;

  const getDeliverableInfo = () => {
    switch (selectedType) {
      case 'question-paper':
        return {
          title: 'প্রশ্নপত্র PDF ডাউনলোড',
          icon: FileText,
          iconColor: 'text-emerald-600',
          bgColor: 'bg-emerald-100 text-emerald-800',
          desc: 'শিক্ষার্থীদের জন্য প্রিন্টযোগ্য পরীক্ষার মূল প্রশ্নপত্র।',
        };
      case 'answer-key':
        return {
          title: 'উত্তরমালা (Answer Key) PDF ডাউনলোড',
          icon: CheckCircle2,
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-100 text-blue-800',
          desc: 'শিক্ষক নির্দেশিকা ও প্রতিটি সেটের নির্ভুল উত্তরমালা সমাধান শিট।',
        };
      case 'omr-sheet':
        return {
          title: 'OMR বাবল শিট PDF ডাউনলোড',
          icon: Grid,
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-100 text-purple-800',
          desc: 'MCQ পরীক্ষার উত্তরবৃত্ত ভরাটের জন্য স্ট্যান্ডার্ড A4 OMR বাবল শিট।',
        };
    }
  };

  const info = getDeliverableInfo();
  const IconComponent = info.icon;
  const sets = availableSets.length > 0 ? availableSets : ['Set A'];

  const handleSingle = async (setName: string) => {
    setDownloadingSet(setName);
    setProgressText(`${setName} ডাউনলোড হচ্ছে...`);
    try {
      await onDownloadSet(setName, selectedType);
      onClose();
    } catch {
      // error handled by parent toast
    } finally {
      setDownloadingSet(null);
      setProgressText('');
    }
  };

  const handleAll = async () => {
    setIsDownloadingAll(true);
    try {
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        setProgressText(`${s} ডাউনলোড হচ্ছে... (${i + 1}/${sets.length})`);
        await onDownloadSet(s, selectedType);
        // Small delay to allow browser to trigger each download smoothly
        await new Promise((r) => setTimeout(r, 400));
      }
      onClose();
    } catch {
      // error handled by parent toast
    } finally {
      setIsDownloadingAll(false);
      setProgressText('');
    }
  };

  const isBusy = downloadingSet !== null || isDownloadingAll;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92dvh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${info.bgColor} flex items-center justify-center shrink-0`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{info.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{info.desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isBusy}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition disabled:opacity-40"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deliverable Type Switcher Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedType('question-paper')}
            disabled={isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition ${
              selectedType === 'question-paper'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>প্রশ্নপত্র</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('answer-key')}
            disabled={isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition ${
              selectedType === 'answer-key'
                ? 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>উত্তরমালা</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('omr-sheet')}
            disabled={isBusy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition ${
              selectedType === 'omr-sheet'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-purple-600" />
            <span>OMR শিট</span>
          </button>
        </div>

        {/* Progress Banner when downloading */}
        {isBusy && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>{progressText}</span>
          </div>
        )}

        {/* Option 1: All Sets Combined Button (If multiple sets exist) */}
        {sets.length > 1 && (
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>একসাথে সব সেট ডাউনলোড</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded-full">
                {sets.length}টি সেট তৈরি
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              এক ক্লিকে {sets.join(', ')} — সবকটি সেটের পিডিএফ আলাদা আলাদা ফাইলে আপনার ডাউনলোড ফোল্ডারে জমা হবে।
            </p>
            <button
              type="button"
              onClick={handleAll}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isDownloadingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{progressText}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>সবগুলো সেট ({sets.length}টি) একসাথে ডাউনলোড করুন</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Option 2: Individual Sets Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            {sets.length > 1 ? 'অথবা নির্দিষ্ট কোনো একটি সেট ডাউনলোড করুন:' : 'সেট নির্বাচন করুন:'}
          </label>
          <div className={`grid ${sets.length > 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'} gap-2`}>
            {sets.map((s) => {
              const isCurrent = activeSet === s;
              const isDownloadingThis = downloadingSet === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSingle(s)}
                  disabled={isBusy}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-slate-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                  } disabled:opacity-50`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold">
                      {s.replace('Set ', '')}
                    </span>
                    <span>{s}</span>
                    {isCurrent && (
                      <span className="text-[10px] text-emerald-600 font-normal">(সক্রিয়)</span>
                    )}
                  </span>
                  {isDownloadingThis ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* If only 1 set exists, show shuffler invitation */}
        {sets.length <= 1 && (
          <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>
                আপনি কি <strong>Set A, Set B, Set C</strong> তৈরি করতে চান?
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSetShuffler();
              }}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shrink-0 transition"
            >
              সেট তৈরি করুন
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
