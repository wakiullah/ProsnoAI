'use client';

import React, { useState, useEffect } from 'react';
import {
  AiProvider,
  getActiveAiProvider,
  getStoredGeminiKey,
  getStoredGeminiModel,
  getStoredOpenRouterKey,
  getStoredOpenRouterModel,
  setActiveAiProvider,
  setStoredGeminiKey,
  setStoredGeminiModel,
  setStoredOpenRouterKey,
  setStoredOpenRouterModel,
  validateAiKey,
} from '../../lib/api';
import { Key, X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ExternalLink, Cpu, Sparkles } from 'lucide-react';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [activeTab, setActiveTab] = useState<AiProvider>('gemini');
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('auto');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('openrouter/free');

  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(getActiveAiProvider());
      setGeminiKey(getStoredGeminiKey());
      setGeminiModel(getStoredGeminiModel());
      setOpenRouterKey(getStoredOpenRouterKey());
      setOpenRouterModel(getStoredOpenRouterModel());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentKey = activeTab === 'gemini' ? geminiKey : openRouterKey;

  const handleTestKey = async () => {
    if (!currentKey.trim()) {
      setTestResult({
        success: false,
        message: `অনুগ্রহ করে প্রথমে একটি ${activeTab === 'gemini' ? 'Gemini' : 'OpenRouter'} API Key লিখুন।`,
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await validateAiKey(activeTab, currentKey.trim());
      if (res.valid) {
        setTestResult({
          success: true,
          message: `অভিনন্দন! ${activeTab === 'gemini' ? 'Google Gemini' : 'OpenRouter'} API Key সফলভাবে যাচাই হয়েছে ও সক্রিয় আছে।`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'API Key সঠিক নয়। অনুগ্রহ করে যাচাই করুন।',
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'সার্ভারের সাথে সংযোগ করতে ব্যর্থ হয়েছে।' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setActiveAiProvider(activeTab);
    setStoredGeminiKey(geminiKey.trim());
    setStoredGeminiModel(geminiModel);
    setStoredOpenRouterKey(openRouterKey.trim());
    setStoredOpenRouterModel(openRouterModel);

    if (onKeySaved) onKeySaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>AI ইঞ্জিন ও API Key কনফিগারেশন</span>
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Switcher Tabs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            সক্রিয় AI ইঞ্জিন নির্বাচন করুন (Choose Active Provider):
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('gemini');
                setTestResult(null);
              }}
              className={`p-3 rounded-lg border text-left transition flex flex-col gap-1 ${
                activeTab === 'gemini'
                  ? 'border-blue-500 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Google Gemini API
                </span>
                {geminiKey ? (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    সেট করা
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-500">
                গুগল এআই স্টুডিও (ফ্রি, দ্রুতগতি ও উচ্চ কোটা)
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('openrouter');
                setTestResult(null);
              }}
              className={`p-3 rounded-lg border text-left transition flex flex-col gap-1 ${
                activeTab === 'openrouter'
                  ? 'border-purple-500 bg-purple-50/70 shadow-sm ring-1 ring-purple-500'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  OpenRouter API
                </span>
                {openRouterKey ? (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    সেট করা
                  </span>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-500">
                মাল্টি-মডেল অটো-রাউটার (Gemma, Llama, Nemotron)
              </p>
            </button>
          </div>
        </div>

        {/* Tab 1: Google Gemini API Configuration */}
        {activeTab === 'gemini' && (
          <div className="space-y-3 pt-1">
            <div className="text-xs text-slate-600 space-y-1.5 bg-blue-50/60 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900">
                Google Gemini API Key কীভাবে পাবেন?
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[11px]">
                <li>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline font-semibold inline-flex items-center gap-1 hover:text-blue-800"
                  >
                    aistudio.google.com/app/apikey <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  এ গিয়ে আপনার গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন।
                </li>
                <li>&quot;Create API Key&quot; বাটনে ক্লিক করে ফ্রি কি তৈরি করুন।</li>
                <li>তৈরি হওয়া <span className="font-mono bg-white px-1 py-0.2 rounded border border-blue-300">AIzaSy...</span> কি-টি কপি করে নিচের বক্সে পেস্ট করুন।</li>
              </ol>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Gemini API Key:
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxxxxx..."
                  className="w-full text-xs font-mono p-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>মডেল রাউটিং ও ফলব্যাক মোড:</span>
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                <option value="auto">
                  ⚡ স্মার্ট অটো-রাউটিং (Gemma 4 ➔ 3.5 Flash-Lite ➔ 3.1 ➔ 3.8 Flash - Recommended)
                </option>
                <option value="gemma-4-31b-it">
                  Tier 1: gemma-4-31b-it (14,400 RPD উচ্চ দৈনিক কোটা)
                </option>
                <option value="gemini-3.5-flash-lite">
                  Tier 2: gemini-3.5-flash-lite (দ্রুততম 3.5, 1M টোকেন)
                </option>
                <option value="gemini-3.1-flash-lite">
                  Tier 3: gemini-3.1-flash-lite (সাশ্রয়ী লাইটওয়েট ব্যাকআপ)
                </option>
                <option value="gemini-3.8-flash">
                  Tier 4: gemini-3.8-flash (চূড়ান্ত বিশ্লেষণধর্মী মডেল)
                </option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                ইনপুট ৮,০০০ অক্ষরের বেশি হলে স্বয়ংক্রিয়ভাবে Tier 2 থেকে শুরু হবে এবং কোনো মডেল 429/503 দিলে সাথে সাথে পরবর্তী মডেলে ফলব্যাক করবে।
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: OpenRouter API Configuration */}
        {activeTab === 'openrouter' && (
          <div className="space-y-3 pt-1">
            <div className="text-xs text-slate-600 space-y-1.5 bg-purple-50/60 p-3 rounded-lg border border-purple-200">
              <p className="font-semibold text-purple-900">
                OpenRouter API Key কীভাবে পাবেন?
              </p>
              <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[11px]">
                <li>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-700 underline font-semibold inline-flex items-center gap-1 hover:text-purple-800"
                  >
                    openrouter.ai/keys <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  এ গিয়ে সাইন ইন করে কি তৈরি করুন।
                </li>
                <li><span className="font-mono bg-white px-1 py-0.2 rounded border border-purple-300">sk-or-v1-...</span> কিটি কপি করে নিচের বক্সে পেস্ট করুন।</li>
              </ol>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                OpenRouter API Key:
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={openRouterKey}
                  onChange={(e) => {
                    setOpenRouterKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
                  className="w-full text-xs font-mono p-2.5 pr-10 border border-slate-300 rounded-lg focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                <span>OpenRouter মডেল নির্বাচন:</span>
              </label>
              <select
                value={openRouterModel}
                onChange={(e) => setOpenRouterModel(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800"
              >
                <option value="openrouter/free">openrouter/free (অটো-রাউটার - Recommended)</option>
                <option value="google/gemma-4-31b-it:free">google/gemma-4-31b-it:free (গুগল জেম্মা ৩১বি)</option>
                <option value="google/gemma-4-26b-a4b-it:free">google/gemma-4-26b-a4b-it:free (গুগল জেম্মা ২৬বি)</option>
                <option value="nvidia/nemotron-3.5-lightning:free">nvidia/nemotron-3.5-lightning:free (এনভিডিয়া লাইটনিং)</option>
              </select>
            </div>
          </div>
        )}

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={isTesting || !currentKey.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            <span>{activeTab === 'gemini' ? 'Gemini কি টেস্ট করুন' : 'OpenRouter কি টেস্ট করুন'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              বাতিল
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition ${
                activeTab === 'gemini'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {activeTab === 'gemini' ? 'Gemini সক্রিয় করুন' : 'OpenRouter সক্রিয় করুন'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
