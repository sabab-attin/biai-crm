'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Send,
  MessageSquare,
  Users2,
  History,
  Edit3,
  Check,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface Enquiry {
  id: number;
  contact_id?: number;
  name: string;
  phone: string;
  email?: string;
  channel: string;
  received_at: string;
  original_message: string;
  language: string;
  interest: string;
  category: string;
  priority: string;
  status: string;
  ai_summary: string;
  ai_classification_reason?: string;
  ai_recommended_actions?: string;
  is_spam: number;
  is_duplicate: number;
  duplicate_of: number;
  assigned_to?: string;
  follow_up_date?: string;
  last_follow_up?: string;
  human_corrected_interest?: string;
  human_corrected_category?: string;
}

interface DetailData extends Enquiry {
  related_enquiries?: Array<{
    id: number;
    original_message: string;
    received_at: string;
    channel: string;
    status: string;
    interest: string;
  }>;
  replies?: Array<{
    id: number;
    reply_text: string;
    language: string;
    tone: string;
    created_at: string;
  }>;
  feedback?: Array<{
    id: number;
    field_name: string;
    ai_value: string;
    corrected_value: string;
    created_at: string;
  }>;
  activity?: Array<{
    id: number;
    action: string;
    details: string;
    created_at: string;
  }>;
}

interface EnquiryDetailDrawerProps {
  enquiryId: number | null;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string) => void;
  onEnquiryUpdated: () => void;
}

export default function EnquiryDetailDrawer({
  enquiryId,
  onClose,
  onUpdateStatus,
  onEnquiryUpdated,
}: EnquiryDetailDrawerProps) {
  const [data, setData] = useState<DetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Human-in-the-loop editing
  const [isEditingClassification, setIsEditingClassification] = useState(false);
  const [editInterest, setEditInterest] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isSavingCorrection, setIsSavingCorrection] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  // Reply generator
  const [replyLang, setReplyLang] = useState<'English' | 'Bangla' | 'Banglish'>('English');
  const [replyTone, setReplyTone] = useState<'formal' | 'friendly' | 'concise'>('friendly');
  const [replyDraft, setReplyDraft] = useState('');
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isRecordingReply, setIsRecordingReply] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Load detailed enquiry record
  useEffect(() => {
    if (!enquiryId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await fetch(`/api/enquiries/${enquiryId}`);
        if (!res.ok) throw new Error('Failed to load enquiry record');
        const json = await res.json();
        if (!isMounted) return;

        setData(json);
        setEditInterest(json.interest || 'General');
        setEditCategory(json.category || 'Sales');

        // Auto-select language based on detected language
        if (json.language === 'Bangla') setReplyLang('Bangla');
        else if (json.language === 'Banglish') setReplyLang('Banglish');
        else setReplyLang('English');

        // If existing replies, set draft to latest or clear
        if (json.replies && json.replies.length > 0) {
          setReplyDraft(json.replies[0].reply_text);
        } else {
          setReplyDraft('');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Error fetching details';
        setErrorMessage(msg);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [enquiryId]);

  if (!enquiryId) return null;

  // Handle stage change
  const handleStageChange = async (newStatus: string) => {
    if (!data) return;
    onUpdateStatus(data.id, newStatus);
    setData((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  // Human-in-the-loop correction save
  const handleSaveCorrection = async () => {
    if (!data) return;
    setIsSavingCorrection(true);
    try {
      const res = await fetch(`/api/enquiries/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          human_corrected_interest: editInterest,
          human_corrected_category: editCategory,
          interest: editInterest,
          category: editCategory,
        }),
      });

      if (!res.ok) throw new Error('Failed to save AI feedback');

      setData((prev) =>
        prev
          ? {
              ...prev,
              interest: editInterest,
              category: editCategory,
              human_corrected_interest: editInterest,
              human_corrected_category: editCategory,
            }
          : null
      );
      setIsEditingClassification(false);
      setCorrectionSuccess(true);
      setTimeout(() => setCorrectionSuccess(false), 3000);
      onEnquiryUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving correction';
      alert(msg);
    } finally {
      setIsSavingCorrection(false);
    }
  };

  // Generate Reply with AI
  const handleGenerateReply = async () => {
    if (!data) return;
    setIsGeneratingReply(true);
    try {
      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: data.original_message,
          customerName: data.name,
          interest: data.interest,
          language: replyLang,
          tone: replyTone,
        }),
      });

      const resData = await res.json();
      if (resData.reply) {
        setReplyDraft(resData.reply);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating reply';
      alert(msg);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Copy reply to clipboard
  const handleCopyReply = () => {
    navigator.clipboard.writeText(replyDraft);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Record reply in CRM database
  const handleRecordReply = async () => {
    if (!data || !replyDraft.trim()) return;
    setIsRecordingReply(true);
    try {
      const res = await fetch(`/api/enquiries/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: data.status === 'New' ? 'Contacted' : data.status,
          last_follow_up: new Date().toISOString(),
          new_reply: {
            text: replyDraft,
            language: replyLang,
            tone: replyTone,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to record reply');

      // Refresh data
      const refreshRes = await fetch(`/api/enquiries/${data.id}`);
      const refreshedJson = await refreshRes.json();
      setData(refreshedJson);
      onEnquiryUpdated();
      alert('Reply successfully logged to customer timeline!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error recording reply';
      alert(msg);
    } finally {
      setIsRecordingReply(false);
    }
  };

  // Parse recommended actions
  let recommendedActions: string[] = [];
  try {
    if (data?.ai_recommended_actions) {
      recommendedActions = JSON.parse(data.ai_recommended_actions);
    }
  } catch {
    recommendedActions = [];
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 drawer-backdrop transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Window */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 overflow-hidden animate-fadeIn">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              {data?.name ? data.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                  {data?.name || 'Loading Customer...'}
                </h3>
                {data?.is_duplicate === 1 && (
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">
                    2 Enquiries Linked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>{data?.channel}</span>
                <span>•</span>
                <span>Received: {data?.received_at}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            Loading enquiry intelligence...
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Customer 360° Consolidated Duplicate Profile Banner */}
            {data.is_duplicate === 1 && (
              <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Users2 className="w-4 h-4 text-blue-700" />
                  <span>Customer 360° Profile: Repeated Contact Detected</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  <strong>{data.name}</strong> ({data.phone}) has reached out multiple times. Inquiries #1 and #12 are linked under one profile so no context is lost.
                </p>

                {data.related_enquiries && data.related_enquiries.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-blue-200">
                    <span className="font-semibold text-blue-950 block">Previous Inbound Messages:</span>
                    {data.related_enquiries.map((rel) => (
                      <div key={rel.id} className="p-2 rounded bg-white border border-blue-200 text-[11px] text-slate-800">
                        <div className="flex justify-between text-slate-400 mb-0.5">
                          <span>{rel.channel} • Enquiry #{rel.id}</span>
                          <span>{rel.received_at}</span>
                        </div>
                        <p className="font-sans italic">&ldquo;{rel.original_message}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sales Pipeline Stage Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Sales Pipeline Stage
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {['New', 'Contacted', 'Interested', 'Paid', 'Lost'].map((st) => {
                  const isActive = data.status === st;
                  return (
                    <button
                      key={st}
                      onClick={() => handleStageChange(st)}
                      className={`py-1.5 px-2 rounded text-xs font-semibold transition border ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Original Inbound Message Card */}
            <div className="saas-card p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> Original Customer Message
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                  Detected: {data.language}
                </span>
              </div>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded border border-slate-200/80 leading-relaxed font-sans">
                &ldquo;{data.original_message}&rdquo;
              </p>
            </div>

            {/* AI Smart Triage & Explainable AI */}
            <div className="saas-card p-4 space-y-3 border-l-4 border-l-blue-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    AI Smart Triage & Intent
                  </h4>
                </div>

                {/* Human-in-the-loop edit button */}
                <button
                  onClick={() => setIsEditingClassification(!isEditingClassification)}
                  className="btn-subtle text-xs py-0.5 px-2 flex items-center gap-1 text-slate-600"
                >
                  <Edit3 className="w-3 h-3 text-slate-500" />
                  <span>{isEditingClassification ? 'Cancel Correction' : 'Correct Classification'}</span>
                </button>
              </div>

              {/* Correction Form */}
              {isEditingClassification ? (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-3 animate-fadeIn">
                  <div className="text-xs font-semibold text-amber-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Human-in-the-Loop AI Feedback
                  </div>
                  <p className="text-[11px] text-amber-800">
                    If AI misclassified this customer, update it below. Your correction will be recorded to monitor AI model accuracy.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Interest / Program</label>
                      <select
                        value={editInterest}
                        onChange={(e) => setEditInterest(e.target.value)}
                        className="input-base text-xs py-1"
                      >
                        <option value="Bootcamp">Bootcamp</option>
                        <option value="Fellowship">Fellowship</option>
                        <option value="Corporate Training">Corporate Training</option>
                        <option value="General">General</option>
                        <option value="Support">Support</option>
                        <option value="Job Application">Job Application</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="input-base text-xs py-1"
                      >
                        <option value="Sales">Sales</option>
                        <option value="Support">Support</option>
                        <option value="Corporate Lead">Corporate Lead</option>
                        <option value="Job Application">Job Application</option>
                        <option value="Spam">Spam</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCorrection}
                    disabled={isSavingCorrection}
                    className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSavingCorrection ? 'Saving Feedback...' : 'Save Human Correction'}
                  </button>
                </div>
              ) : null}

              {correctionSuccess && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Classification updated and recorded in AI feedback database!
                </div>
              )}

              {/* Triage Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                  <span className="font-semibold text-slate-800">{data.category}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Offering</span>
                  <span className="font-semibold text-blue-700">{data.interest || 'General'}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Priority</span>
                  <span className="font-semibold text-slate-800">{data.priority}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Spam Flag</span>
                  <span className={`font-semibold ${data.is_spam ? 'text-red-600' : 'text-emerald-700'}`}>
                    {data.is_spam ? 'Yes (Filtered)' : 'No'}
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              {data.ai_summary && (
                <div className="p-2.5 rounded bg-blue-50/50 border border-blue-100 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider block">
                    AI Summary
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">{data.ai_summary}</p>
                </div>
              )}

              {/* Explainable AI Decision Reasoning */}
              {data.ai_classification_reason && (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-slate-400" /> Explainable AI Decision Reason
                  </span>
                  <p className="text-slate-600 leading-relaxed">{data.ai_classification_reason}</p>
                </div>
              )}

              {/* Recommended Next Actions */}
              {recommendedActions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider block">
                    Suggested Next Actions
                  </span>
                  <div className="space-y-1">
                    {recommendedActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/40 p-2 rounded border border-emerald-100/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Multilingual Reply Studio */}
            <div className="saas-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Multilingual Reply Studio
                  </h4>
                </div>

                <button
                  onClick={handleGenerateReply}
                  disabled={isGeneratingReply}
                  className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-blue-600 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingReply ? 'Drafting...' : 'Draft with AI'}</span>
                </button>
              </div>

              {/* Tone and Language Selectors */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1">Language:</span>
                  {(['English', 'Bangla', 'Banglish'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setReplyLang(lang)}
                      className={`text-[11px] px-2 py-0.5 rounded font-medium transition ${
                        replyLang === lang
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 mr-1">Tone:</span>
                  {(['formal', 'friendly', 'concise'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setReplyTone(t)}
                      className={`text-[11px] px-2 py-0.5 rounded capitalize font-medium transition ${
                        replyTone === t
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Reply Box */}
              <div className="space-y-2">
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Click 'Draft with AI' or type your response here..."
                  rows={4}
                  className="input-base text-xs leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Approved BIAI info • Review draft before sending
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyReply}
                      disabled={!replyDraft.trim()}
                      className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
                    >
                      {copyFeedback ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Reply</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleRecordReply}
                      disabled={!replyDraft.trim() || isRecordingReply}
                      className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isRecordingReply ? 'Logging...' : 'Log & Send'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Past Sent Replies */}
              {data.replies && data.replies.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Recorded Replies History ({data.replies.length})
                  </span>
                  {data.replies.map((rep) => (
                    <div key={rep.id} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Logged via BIAI CRM ({rep.language}, {rep.tone})</span>
                        <span>{rep.created_at}</span>
                      </div>
                      <p className="whitespace-pre-line font-sans">{rep.reply_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity History Timeline */}
            <div className="saas-card p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Customer Activity Timeline
                </h4>
              </div>

              <div className="space-y-2 text-xs border-l-2 border-slate-200 pl-3 ml-1.5">
                {data.activity && data.activity.length > 0 ? (
                  data.activity.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="w-2 h-2 rounded-full bg-blue-600 absolute -left-[17px] top-1" />
                      <p className="font-semibold text-slate-800">{act.details}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{act.created_at}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No activity recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-red-500 text-xs">
            {errorMessage || 'Enquiry record not found'}
          </div>
        )}

        {/* Drawer Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-400">Enquiry ID #{enquiryId}</span>
          <button onClick={onClose} className="btn-secondary text-xs py-1 px-3">
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
}
