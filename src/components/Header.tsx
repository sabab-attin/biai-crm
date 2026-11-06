'use client';

import React from 'react';
import {
  Search,
  Plus,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenQuickAdd: () => void;
  onProcessAllAI: () => void;
  isProcessingAI: boolean;
  urgentCount: number;
  onUrgentClick: () => void;
}

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Operations Dashboard',
    subtitle: 'Live triage, conversion pipeline, and intelligent customer operations',
  },
  inbox: {
    title: 'Smart Enquiry Inbox',
    subtitle: 'Unified multi-channel queue categorized by AI intent and priority',
  },
  pipeline: {
    title: 'B2B & Retail Sales Pipeline',
    subtitle: 'Five-stage commercial deal progression from initial contact to paid',
  },
  'ai-assistant': {
    title: 'AI Assistant & Reply Studio',
    subtitle: 'Extract customer intelligence from raw messages & draft contextual replies',
  },
  contacts: {
    title: 'Customer 360° Directory',
    subtitle: 'Unified customer profiles with linked multi-enquiry conversation history',
  },
  'follow-ups': {
    title: 'Follow-up & 48-Hour SLA Manager',
    subtitle: 'Automated monitoring to ensure no prospective student or client is lost',
  },
  insights: {
    title: 'AI Business Insights & Quality Tracker',
    subtitle: 'Executive intelligence briefings and human-in-the-loop AI corrections',
  },
};

export default function Header({
  activeTab,
  searchQuery,
  onSearchChange,
  onOpenQuickAdd,
  onProcessAllAI,
  isProcessingAI,
  urgentCount,
  onUrgentClick,
}: HeaderProps) {
  const meta = tabTitles[activeTab] || { title: 'BIAI CRM', subtitle: 'Operations System' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* View Title */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 tracking-tight leading-tight">
          {meta.title}
        </h2>
        <p className="text-xs text-slate-500 font-normal hidden sm:block">
          {meta.subtitle}
        </p>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search enquiries, names, phones, or messages..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-900 pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Urgent Action Pill */}
        {urgentCount > 0 && (
          <button
            onClick={onUrgentClick}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-medium transition"
            title="Urgent enquiries requiring immediate response"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>{urgentCount} Urgent</span>
          </button>
        )}

        {/* AI Batch Processor */}
        <button
          onClick={onProcessAllAI}
          disabled={isProcessingAI}
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          title="Run full AI triage extraction on all enquiries"
        >
          {isProcessingAI ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">AI Smart Triage</span>
            </>
          )}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickAdd}
          className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Enquiry</span>
        </button>
      </div>
    </header>
  );
}
