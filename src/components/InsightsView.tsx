'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Enquiry } from './SmartInbox';

interface InsightsViewProps {
  enquiries: Enquiry[];
  onRefresh: () => void;
}

export default function InsightsView({ enquiries }: InsightsViewProps) {
  const [insightsText, setInsightsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/insights', { method: 'POST' });
      const data = await res.json();
      if (data.insights) setInsightsText(data.insights);
    } catch {
      // Fallback handled in backend
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai/insights', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.insights) setInsightsText(data.insights);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl">
      {/* Top Header Card */}
      <div className="saas-card p-5 bg-gradient-to-r from-blue-50/50 via-white to-purple-50/30 border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Business Intelligence & Quality Auditing
              </h3>
              <p className="text-xs text-slate-500">
                Actionable strategic findings synthesized from {enquiries.length} customer conversations
              </p>
            </div>
          </div>

          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Compiling Findings...' : 'Refresh AI Insights'}</span>
          </button>
        </div>
      </div>

      {/* Main 5 Key Findings */}
      <div className="saas-card p-6 space-y-4 bg-white border-l-4 border-l-blue-600">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Key Strategic Findings
          </h4>
        </div>

        <div className="prose prose-xs max-w-none text-slate-700 leading-relaxed text-xs font-sans space-y-3">
          {insightsText ? (
            <div
              dangerouslySetInnerHTML={{
                __html: insightsText
                  .replace(/^(\d+\.\s+\*\*(.*?)\*\*)/gm, '<h5 class="text-xs font-bold text-slate-900 mt-3 mb-1">$1</h5>')
                  .replace(/^\s*-\s*(.*$)/gm, '<div class="flex items-start gap-1.5 my-0.5 pl-3"><span class="text-blue-600">•</span><span>$1</span></div>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="text-slate-600 font-medium">$1</em>'),
              }}
            />
          ) : (
            <div className="text-center py-8 text-slate-400">Loading AI intelligence insights...</div>
          )}
        </div>
      </div>

      {/* Human-in-the-Loop AI Feedback Quality Monitor */}
      <div className="saas-card p-6 space-y-3 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Human-in-the-Loop AI Model Quality Monitor
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Continuous Prompt Optimization</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Every time an admissions officer or salesperson overrides an AI classification (Interest or Category), the CRM logs the original prediction and human correction into the <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">ai_feedback</code> audit table. This allows BIAI to evaluate model performance without training a new model.
        </p>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
          <span className="font-semibold text-slate-800 block">How BIAI Evaluates AI Operations:</span>
          <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
            <li>
              <strong>Explainable AI Transparency:</strong> Every classification displays an explicit reason explaining why the intent was classified as Corporate Lead, Support, or Sales.
            </li>
            <li>
              <strong>Safe Fallback Engine:</strong> Ensures 100% operational uptime even during Google AI Studio rate limits or network latency.
            </li>
            <li>
              <strong>Quality Auditing:</strong> Employees can click &ldquo;Correct Classification&rdquo; inside any enquiry drawer to record ground-truth data.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
