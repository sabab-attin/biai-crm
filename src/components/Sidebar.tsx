'use client';

import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Kanban,
  Sparkles,
  Users,
  ClockAlert,
  Lightbulb,
  Database,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: {
    total: number;
    urgentCount: number;
    corporateLeads: number;
    overdueCount: number;
  };
  onReseed: () => void;
  apiKeyConfigured: boolean;
  isSeeding: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Smart Inbox', icon: Inbox },
  { id: 'pipeline', label: 'Sales Pipeline', icon: Kanban },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles, highlight: true },
  { id: 'contacts', label: 'Customer 360°', icon: Users },
  { id: 'follow-ups', label: 'Follow-up SLA', icon: ClockAlert },
  { id: 'insights', label: 'AI Insights & Feedback', icon: Lightbulb },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  stats,
  onReseed,
  apiKeyConfigured,
  isSeeding,
}: SidebarProps) {
  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-slate-200 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm tracking-wider">
            BI
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold text-slate-900 tracking-tight leading-none">BIAI CRM</h1>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Intelligent Operations</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span className="flex-1 text-left">{item.label}</span>

              {item.id === 'inbox' && stats.urgentCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
                  {stats.urgentCount}
                </span>
              )}

              {item.id === 'follow-ups' && stats.overdueCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">
                  {stats.overdueCount}
                </span>
              )}

              {item.highlight && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Ops Panel */}
      <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
        <div className="px-2 pt-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span>AI Engine</span>
          <span className="flex items-center gap-1 text-[10px]">
            <span
              className={`w-2 h-2 rounded-full ${
                apiKeyConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
              }`}
            />
            {apiKeyConfigured ? 'Gemini 2.0' : 'Smart Triage'}
          </span>
        </div>

        <button
          onClick={onReseed}
          disabled={isSeeding}
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[11px] font-medium transition disabled:opacity-50"
        >
          <Database className="w-3.5 h-3.5 text-slate-400" />
          {isSeeding ? 'Seeding...' : 'Reload 20 Enquiries'}
        </button>
      </div>

      {/* Institute Badge */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Bangladesh Institute of AI</span>
        <span>Dhaka</span>
      </div>
    </aside>
  );
}
