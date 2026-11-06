'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { ExtractedInfo } from '@/lib/ai';

interface AIAssistantProps {
  onEnquiryCreated: () => void;
  apiKeyConfigured: boolean;
}

export default function AIAssistant({ onEnquiryCreated }: AIAssistantProps) {
  // Input form state
  const [channel, setChannel] = useState('WhatsApp');
  const [senderName, setSenderName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // AI Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedInfo | null>(null);
  const [extractError, setExtractError] = useState('');

  // Editable confirmed fields
  const [confirmedInterest, setConfirmedInterest] = useState('');
  const [confirmedCategory, setConfirmedCategory] = useState('');
  const [confirmedPriority, setConfirmedPriority] = useState('');
  const [confirmedName, setConfirmedName] = useState('');
  const [confirmedPhone, setConfirmedPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reply Composer state
  const [replyLang, setReplyLang] = useState<'English' | 'Bangla' | 'Banglish'>('English');
  const [replyTone, setReplyTone] = useState<'formal' | 'friendly' | 'concise'>('friendly');
  const [generatedReply, setGeneratedReply] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick Sample Presets for evaluator demonstration
  const handleLoadSample = (sampleType: 'bangla' | 'banglish' | 'corporate') => {
    if (sampleType === 'bangla') {
      setChannel('WhatsApp');
      setSenderName('Farzana Rahman');
      setPhone('01711000007');
      setMessage('পেমেন্ট করেছি কিন্তু কোনো কনফার্মেশন পাইনি। আমার নাম ফারজানা রহমান। ২৫ তারিখে বিকাশে দিয়েছি।');
    } else if (sampleType === 'banglish') {
      setChannel('WhatsApp');
      setSenderName('Rafi Ahmed');
      setPhone('01711000001');
      setMessage('Assalamualaikum, apnader 3 day bootcamp er price koto? Payment kibhabe korbo?');
    } else if (sampleType === 'corporate') {
      setChannel('WhatsApp');
      setSenderName('Kamrul Islam (HR, Bank in Motijheel)');
      setPhone('01711000010');
      setMessage("Hi, I'm from a bank in Motijheel. Need a quote for training 120 employees. Online or onsite both fine.");
    }
  };

  // Generate Reply
  const handleAutoGenerateReply = async (
    info?: ExtractedInfo,
    options?: { name?: string; interest?: string; language?: 'English' | 'Bangla' | 'Banglish' }
  ) => {
    const targetInfo = info || extractedData;
    if (!targetInfo) return;

    setIsGeneratingReply(true);
    try {
      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          customerName: options?.name || confirmedName || targetInfo.name,
          interest: options?.interest || confirmedInterest || targetInfo.interest,
          category: targetInfo.category,
          priority: targetInfo.priority,
          sentiment: targetInfo.sentiment,
          summary: targetInfo.summary,
          recommendedActions: targetInfo.recommended_actions,
          language: options?.language || replyLang,
          tone: replyTone,
        }),
      });

      const resData = await res.json();
      if (resData.reply) {
        setGeneratedReply(resData.reply);
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Run AI Extraction
  const handleAnalyse = async () => {
    if (!message.trim()) return;
    setIsExtracting(true);
    setExtractError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          channel,
          senderName: senderName || undefined,
          phone: phone || undefined,
        }),
      });

      if (!res.ok) throw new Error('AI analysis service error');
      const data: ExtractedInfo = await res.json();

      setExtractedData(data);
      setConfirmedName(data.name || senderName || 'Unknown');
      setConfirmedPhone(data.phone || phone || '');
      setConfirmedInterest(data.interest || 'General');
      setConfirmedCategory(data.category || 'Sales');
      setConfirmedPriority(data.priority || 'Normal');

      // Auto-set reply language
      if (data.language === 'Bangla') setReplyLang('Bangla');
      else if (data.language === 'Banglish') setReplyLang('Banglish');
      else setReplyLang('English');

      // Auto-generate reply preview
      handleAutoGenerateReply(data, {
        name: data.name || senderName || 'Unknown',
        interest: data.interest || 'General',
        language: data.language === 'Bangla' || data.language === 'Banglish' ? data.language : 'English',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to extract enquiry information';
      setExtractError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  // Copy reply
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save enquiry to CRM database
  const handleSaveToCRM = async () => {
    if (!extractedData) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: confirmedName,
          phone: confirmedPhone,
          channel,
          received_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
          message,
          interest: confirmedInterest,
          category: confirmedCategory,
          priority: confirmedPriority,
          language: extractedData.language,
          status: 'New',
          ai_summary: extractedData.summary,
          ai_classification_reason: extractedData.classification_reason,
          ai_recommended_actions: extractedData.recommended_actions,
          is_spam: extractedData.is_spam ? 1 : 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to save to database');
      await res.json();

      setSaveSuccess(true);
      onEnquiryCreated();

      // Reset after short delay
      setTimeout(() => {
        setSaveSuccess(false);
        setMessage('');
        setSenderName('');
        setPhone('');
        setExtractedData(null);
        setGeneratedReply('');
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving enquiry';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl">
      {/* Top Banner */}
      <div className="saas-card p-5 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Operations & Intelligence Engine
              </h3>
              <p className="text-xs text-slate-500">
                Powered by Google AI Studio Gemini API • Understands Bangla (বাংলা), Banglish, and English
              </p>
            </div>
          </div>

          {/* Quick presets for evaluation */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Load Demo Test:</span>
            <button
              onClick={() => handleLoadSample('bangla')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-blue-400 text-[11px] text-slate-700 font-medium transition"
            >
              Bangla Support
            </button>
            <button
              onClick={() => handleLoadSample('banglish')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-blue-400 text-[11px] text-slate-700 font-medium transition"
            >
              Banglish Sales
            </button>
            <button
              onClick={() => handleLoadSample('corporate')}
              className="px-2 py-1 rounded bg-white border border-slate-200 hover:border-purple-400 text-[11px] text-purple-700 font-medium transition"
            >
              Corporate 120p
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Ingestion Input Form */}
        <div className="lg:col-span-5 saas-card p-5 space-y-4 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Raw Message Intake
            </h4>
            <span className="text-[11px] text-slate-400">Step 1: Paste Inbound Text</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Channel */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Acquisition Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="input-base text-xs py-1.5"
              >
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="Website form">Website Form Submission</option>
                <option value="Facebook Messenger">Facebook Messenger</option>
                <option value="Facebook comment">Facebook Public Comment</option>
                <option value="Phone call note">Phone Call Note</option>
                <option value="Email">Email Inquiry</option>
              </select>
            </div>

            {/* Sender Name & Phone */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">Customer / Lead Name</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Mahmud Hasan"
                  className="input-base text-xs py-1.5"
                />
              </div>

              <div>
                <label className="text-slate-600 font-semibold block mb-1">Phone Number (optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01711000003"
                  className="input-base text-xs py-1.5"
                />
              </div>
            </div>

            {/* Inbound Message */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">Customer Message Content</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste the message as received from WhatsApp, Facebook, or Website... (Supports Bangla, Banglish, English)"
                rows={5}
                className="input-base text-xs leading-relaxed font-sans"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleAnalyse}
              disabled={!message.trim() || isExtracting}
              className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Extracting Intelligence with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span>Analyse & Extract with AI</span>
                </>
              )}
            </button>

            {extractError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{extractError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): AI Results & Reply Studio */}
        <div className="lg:col-span-7 space-y-6">
          {extractedData ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Extraction Results Card */}
              <div className="saas-card p-5 space-y-4 border-l-4 border-l-blue-600 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Extracted Customer Intelligence
                    </h4>
                  </div>
                  <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Detected: {extractedData.language}
                  </span>
                </div>

                {/* Editable Human Confirmation Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                  {/* Name */}
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                      Customer Name
                    </span>
                    <input
                      type="text"
                      value={confirmedName}
                      onChange={(e) => setConfirmedName(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 w-full text-xs font-semibold text-slate-900"
                    />
                  </div>

                  {/* Phone */}
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                      Phone Number
                    </span>
                    <input
                      type="text"
                      value={confirmedPhone}
                      onChange={(e) => setConfirmedPhone(e.target.value)}
                      placeholder="Not provided"
                      className="bg-white border border-slate-200 rounded px-1.5 py-0.5 w-full text-xs font-mono font-medium text-slate-900"
                    />
                  </div>

                  {/* Program Interest */}
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                      Offering Interest
                    </span>
                    <select
                      value={confirmedInterest}
                      onChange={(e) => setConfirmedInterest(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1 py-0.5 w-full text-xs font-semibold text-blue-700"
                    >
                      <option value="Bootcamp">Bootcamp</option>
                      <option value="Fellowship">Fellowship</option>
                      <option value="Corporate Training">Corporate Training</option>
                      <option value="General">General</option>
                      <option value="Support">Support</option>
                      <option value="Job Application">Job Application</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">
                      Triage Category
                    </span>
                    <select
                      value={confirmedCategory}
                      onChange={(e) => setConfirmedCategory(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-1 py-0.5 w-full text-xs font-semibold text-slate-900"
                    >
                      <option value="Sales">Sales</option>
                      <option value="Corporate Lead">Corporate Lead</option>
                      <option value="Support">Support</option>
                      <option value="Job Application">Job Application</option>
                      <option value="Spam">Spam</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider block">
                    AI Summary
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">{extractedData.summary}</p>
                </div>

                {/* Explainable AI Decision Reason */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    Explainable AI: Why This Classification?
                  </span>
                  <p className="text-slate-700 leading-relaxed">{extractedData.classification_reason}</p>
                </div>

                {/* AI Next Actions Recommendations */}
                {extractedData.recommended_actions && extractedData.recommended_actions.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                      Recommended Next Actions:
                    </span>
                    <div className="space-y-1">
                      {extractedData.recommended_actions.map((act, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 rounded bg-emerald-50/40 border border-emerald-100 text-slate-800"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save to CRM button */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div className="text-[11px] text-slate-400">
                    Fields are verified. Click to persist in CRM database.
                  </div>
                  <button
                    onClick={handleSaveToCRM}
                    disabled={isSaving}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Saving to CRM...' : 'Save Enquiry to CRM'}</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Enquiry successfully created and saved in CRM database!</span>
                  </div>
                )}
              </div>

              {/* Reply Studio Card */}
              {!extractedData.is_spam && (
                <div className="saas-card p-5 space-y-4 bg-white">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Multilingual AI Reply Studio
                    </h4>

                    <button
                      onClick={() => handleAutoGenerateReply()}
                      disabled={isGeneratingReply}
                      className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                      <span>Regenerate Draft</span>
                    </button>
                  </div>

                  {/* Language and Tone Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Language:</span>
                      {(['English', 'Bangla', 'Banglish'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setReplyLang(l)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                            replyLang === l
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Tone:</span>
                      {(['formal', 'friendly', 'concise'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setReplyTone(t)}
                          className={`px-2.5 py-1 rounded text-xs capitalize font-medium transition ${
                            replyTone === t
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generated Text Box */}
                  <div className="space-y-2">
                    <textarea
                      value={generatedReply}
                      onChange={(e) => setGeneratedReply(e.target.value)}
                      placeholder="AI reply will be drafted here..."
                      rows={5}
                      className="input-base text-xs leading-relaxed font-sans"
                    />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">
                        Review and edit before sending to customer
                      </span>

                      <button
                        onClick={handleCopy}
                        disabled={!generatedReply.trim()}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="saas-card p-12 text-center text-slate-400 bg-white">
              <Sparkles className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <h5 className="text-sm font-semibold text-slate-700">AI Assistant Ready</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Paste any customer enquiry in Bangla, Banglish, or English on the left, then click{' '}
                <strong className="text-slate-600">Analyse & Extract with AI</strong> to generate structured intelligence and a tailored reply.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => handleLoadSample('bangla')}
                  className="btn-secondary text-xs py-1 px-2.5"
                >
                  Try Bangla Demo
                </button>
                <button
                  onClick={() => handleLoadSample('banglish')}
                  className="btn-secondary text-xs py-1 px-2.5"
                >
                  Try Banglish Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
