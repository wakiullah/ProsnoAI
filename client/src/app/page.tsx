import React from 'react';
import Link from 'next/link';
import { Sparkles, FileText, Database, Printer, CheckCircle2, Languages, ShieldCheck, Shuffle } from 'lucide-react';

export default function HomePage() {
  const typologies = [
    { title: 'সাধারণ বহুনির্বাচনী (Simple MCQ)', desc: 'ক, খ, গ, ঘ অপশন সহ বোর্ড স্ট্যান্ডার্ড প্রশ্ন' },
    { title: 'বহুপদী সমাপ্তিসূচক MCQ', desc: 'i, ii, iii তথ্য ও সমন্বিত অপশন বিশিষ্ট প্রশ্ন' },
    { title: 'অভিন্ন তথ্যভিত্তিক / অনুচ্ছেদ গ্রুপ', desc: 'উদ্দীপক ও ২-৩টি সংশ্লিষ্ট প্রশ্ন' },
    { title: 'সৃজনশীল প্রশ্ন (CQ - Bloom\'s)', desc: 'জ্ঞানমূলক, অনুধাবনমূলক, প্রয়োগমূলক ও উচ্চতর দক্ষতা' },
    { title: 'শূন্যস্থান পূরণ (Fill in Blanks)', desc: 'ক্লু বক্স সহ অথবা ক্লু ছাড়া নম্বরযুক্ত শূন্যস্থান' },
    { title: 'মিলকরণ ছক (Matching Table)', desc: 'কলাম ক, খ এবং গ এর সমন্বয়ে অর্থপূর্ণ বাক্য গঠন' },
    { title: 'বর্ণনামূলক ও ব্যাকরণ', desc: 'সংক্ষিপ্ত প্রশ্ন, আরবি এরাব/তারকিব, অনুবাদ ও পুনর্বিন্যাস' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 border-b border-slate-200 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>বাংলাদেশের শিক্ষাব্যবস্থার উপযোগী প্রথম AI প্রশ্নপত্র প্ল্যাটফর্ম</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            বোর্ড স্ট্যান্ডার্ড <span className="text-emerald-700">প্রশ্নপত্র তৈরি ও PDF প্রিন্ট</span>
            <br />
            <span className="text-2xl sm:text-4xl font-bold text-slate-700">
              বাংলা, ইংরেজি ও পূর্ণ এরাবযুক্ত আরবিতে
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            স্কুল, কলেজ, মাদ্রাসা, বিশ্ববিদ্যালয় ভর্তি ও চাকরির পরীক্ষার জন্য নির্ভুল প্রশ্ন জেনারেট করুন। 
            একই লাইনে বাংলা, ইংরেজি ও আরবি লিখলেও ফন্ট বা যতিচিহ্ন কখনোই উল্টাবে না।
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-md sm:max-w-none mx-auto">
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-200 hover:from-emerald-700 hover:to-teal-700 transition sm:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>প্রশ্নপত্র তৈরি ও এডিটর (/create)</span>
            </Link>
            <Link
              href="/bank"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              <Database className="w-4 h-4" />
              <span>প্রশ্ন ব্যাংক</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Highlights */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Languages className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">জিরো ফন্ট-ব্রেকিং ও BiDi আইসোলেশন</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              বাংলা যুক্তাক্ষর, আরবি জের-জবর-পেশ এবং ইংরেজি টেক্সট একই সাথে থাকলেও ব্র্যাকেট ও যতিচিহ্ন উল্টে যাওয়ার কোনো ঝুঁকি নেই।
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">১-কলাম ও ২-কলাম বোর্ড লেআউট PDF</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Puppeteer ইঞ্জিনের সাহায্যে হাই-রেজোলিউশন প্রশ্নপত্র, শিক্ষকের জন্য নির্ভুল উত্তরমালা এবং OMR বাবল শিট এক ক্লিকে ডাউনলোড করুন।
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow transition">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <Shuffle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">স্মার্ট সেট শাফল (Set A/B/C/D)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              অনুচ্ছেদ-সংযুক্ত প্রশ্ন ঠিক রেখে একক প্রশ্ন ও অপশনগুলো স্বয়ংক্রিয়ভাবে শাফল করে প্রতিটি সেটের জন্য নির্ভুল উত্তরমালা ম্যাপ করা হয়।
            </p>
          </div>
        </div>
      </section>

      {/* 7 Bangladeshi Typologies Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="border border-slate-200 bg-white rounded-xl p-6 sm:p-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-900">৭টি বোর্ড-অনুমোদিত প্রশ্ন ফরম্যাট</h2>
            <p className="text-sm text-slate-500 mt-1">
              জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) ও মাদ্রাসা বোর্ডের প্রতিটি প্রশ্ন কাঠামো পূর্ণাঙ্গ সমর্থনযোগ্য।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {typologies.map((t, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
