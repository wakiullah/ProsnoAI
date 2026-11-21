'use client';

import React from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { IkhtibarItemConfig } from './arabic2ndDefaults';
import { ArabicWordBoxPreview } from './ArabicWordBoxPreview';

interface IkhtibarItemCardProps {
  item: IkhtibarItemConfig;
  index: number;
  letter: string;
  onToggle: (enabled: boolean) => void;
  onChange: (updated: IkhtibarItemConfig) => void;
  onDelete?: () => void;
}

const ARABIC_DIGITS = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'];

export const IkhtibarItemCard: React.FC<IkhtibarItemCardProps> = ({
  item,
  index,
  letter,
  onToggle,
  onChange,
  onDelete,
}) => {
  const handleTitleChange = (title: string) => {
    onChange({ ...item, title });
  };

  const handleWordListChange = (wordListText: string) => {
    onChange({ ...item, wordListText });
  };

  const handleSentenceChange = (sIdx: number, val: string) => {
    const list = [...(item.sentences || [])];
    list[sIdx] = val;
    onChange({ ...item, sentences: list });
  };

  const handleAddSentence = () => {
    const list = [...(item.sentences || []), ''];
    onChange({ ...item, sentences: list });
  };

  const handleDeleteSentence = (sIdx: number) => {
    const list = (item.sentences || []).filter((_, i) => i !== sIdx);
    onChange({ ...item, sentences: list });
  };

  const handleBoxWordsChange = (raw: string) => {
    const words = raw
      .split(/[،,|+]/)
      .map((w) => w.trim())
      .filter(Boolean);
    onChange({ ...item, boxWords: words });
  };

  const handlePassageChange = (passageText: string) => {
    onChange({ ...item, passageText });
  };

  return (
    <div
      className={`border rounded-2xl transition-all ${
        item.enabled
          ? 'bg-white border-teal-300 shadow-2xs'
          : 'bg-slate-50 border-slate-200 opacity-60'
      }`}
    >
      {/* Header bar */}
      <div className="p-3.5 flex items-center justify-between gap-3 border-b border-slate-100">
        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 shrink-0"
          />
          <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-900 font-serif font-bold text-sm flex items-center justify-center shrink-0">
            ({letter})
          </span>
          <span className="font-serif font-bold text-xs sm:text-sm text-slate-800 truncate">
            {item.title}
          </span>
        </label>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition shrink-0"
            title="আইটেমটি সম্পূর্ণ মুছে ফেলুন"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Body content if enabled */}
      {item.enabled && (
        <div className="p-4 space-y-3 bg-teal-50/20">
          {/* Main instruction / Question title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              প্রশ্নের নির্দেশনা (Question Title):
            </label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              dir="rtl"
              className="w-full px-3 py-1.5 text-xs font-serif font-bold border border-slate-300 rounded-xl bg-white text-right focus:border-teal-500 focus:outline-none text-slate-900"
              placeholder="اكتب التوجيه هنا..."
            />
          </div>

          {/* Type 1: Word List (الصحة والعلة / المجرد والمزيد) */}
          {item.type === 'word_list' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                الأفعال والكلمات المطلوبة (শব্দতালিকা):
              </label>
              <textarea
                value={item.wordListText || ''}
                onChange={(e) => handleWordListChange(e.target.value)}
                dir="rtl"
                rows={2}
                className="w-full px-3 py-1.5 text-xs font-serif border border-slate-300 rounded-xl bg-white text-right focus:border-teal-500 focus:outline-none"
                placeholder="قِيْمَ، سَفَرْجَلَ، زُلْزِلَ، اِنْقَسَمَ، يَسْعَى..."
              />
            </div>
          )}

          {/* Type 2: Sentence List (نوع الجموع / استخراج المبتداء / تصحيح الجمل / تركيب) */}
          {item.type === 'sentence_list' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                <span>الجمل (বাক্যসমূহ - ১ থেকে ৫):</span>
                <span>মোট {(item.sentences || []).length}টি বাক্য</span>
              </div>

              {(item.sentences || []).map((sent, sIdx) => {
                const digit = ARABIC_DIGITS[sIdx] || String(sIdx + 1);
                return (
                  <div
                    key={sIdx}
                    className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-300 transition"
                  >
                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-800 font-serif font-bold flex items-center justify-center shrink-0 text-xs">
                      ({digit})
                    </span>
                    <input
                      type="text"
                      value={sent}
                      onChange={(e) => handleSentenceChange(sIdx, e.target.value)}
                      dir="rtl"
                      className="flex-1 px-2 py-1 text-xs font-serif border-none text-right focus:outline-none bg-transparent"
                      placeholder="اكتب الجملة هنا..."
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteSentence(sIdx)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition shrink-0"
                      title="বাক্যটি বাদ দিন"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddSentence}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-white hover:bg-teal-50 border border-teal-300 rounded-lg transition shadow-2xs font-serif"
              >
                <Plus className="w-3 h-3" />
                <span>+ إضافة جملة أخرى (বাক্য যোগ করুন)</span>
              </button>
            </div>
          )}

          {/* Type 3: Cloze Box (الصندوق والفقرة) */}
          {item.type === 'cloze_box' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  الكلمات في الصندوق (ক্লু-বক্সের শব্দসমূহ, কমা বা পাইপ দিয়ে পৃথক করুন):
                </label>
                <input
                  type="text"
                  value={(item.boxWords || []).join(' ، ')}
                  onChange={(e) => handleBoxWordsChange(e.target.value)}
                  dir="rtl"
                  className="w-full px-3 py-1.5 text-xs font-serif border border-slate-300 rounded-xl bg-white text-right focus:border-teal-500 focus:outline-none"
                  placeholder="خادم ، جلبابا ، يأخذ ، كعامة ، زيت ، خليفة"
                />
              </div>

              {/* Live Box Preview */}
              <ArabicWordBoxPreview words={item.boxWords || []} />

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  نص العبارة مع الفراغات (শূন্যস্থানযুক্ত অনুচ্ছেদ):
                </label>
                <textarea
                  value={item.passageText || ''}
                  onChange={(e) => handlePassageChange(e.target.value)}
                  dir="rtl"
                  rows={3}
                  className="w-full px-3 py-1.5 text-xs font-serif border border-slate-300 rounded-xl bg-white text-right focus:border-teal-500 focus:outline-none"
                  placeholder="كان عمر (رض) (أ) ............ ثانيا للإسلام..."
                />
              </div>
            </div>
          )}

          {/* Type 4: Tashkeel (شكل العبارة) */}
          {item.type === 'tashkeel' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                العبارة للشكل (হরকত দেওয়ার জন্য এবারত / হাদিস):
              </label>
              <textarea
                value={item.passageText || ''}
                onChange={(e) => handlePassageChange(e.target.value)}
                dir="rtl"
                rows={3}
                className="w-full px-3 py-1.5 text-xs font-serif border border-slate-300 rounded-xl bg-white text-right focus:border-teal-500 focus:outline-none"
                placeholder="عن ابى سعيدن الخدرى (رض) عن رسول الله صلى الله عليه وسلم قال : ..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
