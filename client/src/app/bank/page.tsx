'use client';

import React, { useState, useEffect } from 'react';
import { QuestionData, QuestionTypology } from 'proshno-shared';
import { fetchQuestionBank } from '../../lib/api';
import { usePaperCartStore } from '../../store/usePaperCartStore';
import { QuestionCardRenderer } from '../../components/question-types/QuestionCardRenderer';
import { Database, Search, Filter, PlusCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function BankPage() {
  const { addQuestion, addQuestions } = usePaperCartStore();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTypology, setSelectedTypology] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedTypology) params.typology = selectedTypology;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const data = await fetchQuestionBank(params);
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching question bank:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject, selectedTypology, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadQuestions();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-sm border border-emerald-600 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            <span>ব্যক্তিগত প্রশ্ন ব্যাংক (Question Bank)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            সংরক্ষিত সকল প্রশ্ন ব্রাউজ করুন এবং প্রয়োজনমতো প্রশ্নপত্রে যুক্ত করুন।
          </p>
        </div>

        {questions.length > 0 && (
          <button
            onClick={() => {
              addQuestions(questions);
              showToast(`সকল ${questions.length}টি প্রশ্ন প্রশ্নপত্রে যোগ করা হয়েছে!`);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>সকল ফিল্টারকৃত প্রশ্ন প্রশ্নপত্রে নিন</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="প্রশ্নের মূল কথা, অনুচ্ছেদ বা ট্যাগ দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
          >
            অনুসন্ধান
          </button>
        </form>

        <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-2.5 sm:gap-3 pt-2 border-t text-xs">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            ফিল্টার:
          </span>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto p-2 sm:p-1.5 border border-slate-300 rounded-lg sm:rounded text-slate-700"
          >
            <option value="">সকল বিষয়</option>
            <option value="বাংলা">বাংলা</option>
            <option value="English">English</option>
            <option value="গণিত">গণিত</option>
            <option value="পদার্থবিজ্ঞান">পদার্থবিজ্ঞান</option>
            <option value="রসায়ন">রসায়ন</option>
            <option value="আরবি">আরবি / কুরআন / হাদিস</option>
          </select>

          <select
            value={selectedTypology}
            onChange={(e) => setSelectedTypology(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-slate-700"
          >
            <option value="">সকল ধরন (All Typologies)</option>
            <option value="SIMPLE_MCQ">সাধারণ MCQ</option>
            <option value="MULTIPLE_COMPLETION_MCQ">বহুপদী সমাপ্তিসূচক MCQ</option>
            <option value="PASSAGE_GROUP">অভিন্ন তথ্যভিত্তিক গ্রুপ</option>
            <option value="CQ">সৃজনশীল প্রশ্ন (CQ)</option>
            <option value="FILL_BLANKS">শূন্যস্থান পূরণ</option>
            <option value="MATCHING">মিলকরণ ছক</option>
            <option value="DESCRIPTIVE">সংক্ষিপ্ত / ব্যাকরণ</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="p-1.5 border border-slate-300 rounded text-slate-700"
          >
            <option value="">সকল কঠিন্য</option>
            <option value="Easy">সহজ (Easy)</option>
            <option value="Medium">মাঝারি (Medium)</option>
            <option value="Hard">উচ্চতর (Hard)</option>
          </select>

          <button
            onClick={loadQuestions}
            className="ml-auto text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <span>প্রশ্ন লোড হচ্ছে...</span>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-2">
            <Database className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">কোনো প্রশ্ন পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500">
              AI প্রশ্ন জেনারেটর থেকে প্রশ্ন তৈরি করে ব্যাংকে সেভ করুন।
            </p>
          </div>
        ) : (
          questions.map((q, qIdx) => (
            <QuestionCardRenderer
              key={q._id || qIdx}
              question={q}
              index={qIdx + 1}
              onAddToPaper={() => {
                addQuestion(q);
                showToast(`প্রশ্ন নং ${qIdx + 1} প্রশ্নপত্রে যোগ হয়েছে!`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
