'use client';

import React from 'react';
import {
  Inbox,
  Building2,
  AlertTriangle,
  Clock,
  Ban,
  Users2,
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  MessageSquare,
  Globe,
  Share2,
  Phone,
  RefreshCw,
} from 'lucide-react';

export interface DashboardStats {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  byChannel: Array<{ channel: string; count: number }>;
  byInterest: Array<{ interest: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  corporateLeads: number;
  spamCount: number;
  duplicateCount: number;
  urgentCount: number;
  overdueCount: number;
  recentActivity: Array<{ id: number; name: string; action: string; details: string; created_at: string }>;
}

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  channel: string;
  received_at: string;
  original_message: string;
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
}

interface DashboardProps {
  stats: DashboardStats;
  enquiries: Enquiry[];
  onNavigate: (tab: string) => void;
  onSelectEnquiry: (enquiry: Enquiry) => void;
  weeklySummary: string;
  onRefreshSummary: () => void;
  isLoadingSummary: boolean;
}

export default function Dashboard({
  stats,
  enquiries,
  onNavigate,
  onSelectEnquiry,
  weeklySummary,
  onRefreshSummary,
  isLoadingSummary,
}: DashboardProps) {
  // Urgent and high-priority enquiries for the alert queue
  const urgentQueue = enquiries.filter(
    (e) => (e.priority === 'Urgent' || e.priority === 'High') && e.status !== 'Paid' && e.status !== 'Lost'
  );

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'WhatsApp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Website form':
        return <Globe className="w-3.5 h-3.5 text-blue-600" />;
      case 'Facebook Messenger':
      case 'Facebook comment':
        return <Share2 className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Phone call note':
        return <Phone className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Inbox className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  // Pipeline stage counts from actual DB
  const getStatusCount = (st: string) => {
    const item = stats.byStatus.find((s) => s.status.toLowerCase() === st.toLowerCase());
    return item ? item.count : 0;
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Welcome & KPI Metrics */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Executive Summary</h3>
            <p className="text-xs text-slate-500">
              Active operating dataset: 20 incoming multi-channel enquiries (Oct 26–27, 2026)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('inbox')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <span>View All Enquiries</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Grid KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div
            onClick={() => onNavigate('inbox')}
            className="saas-card p-4 cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-600">Total Inbound</span>
              <Inbox className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Across 5 channels</span>
            </div>
          </div>

          {/* Urgent Attention */}
          <div
            onClick={() => onNavigate('inbox')}
            className="saas-card p-4 cursor-pointer hover:border-red-300 transition bg-red-50/20"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-red-700">Urgent Attention</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">{stats.urgentCount}</div>
            <div className="text-[11px] text-red-600/80 mt-1">Requires same-day response</div>
          </div>

          {/* Corporate B2B */}
          <div
            onClick={() => onNavigate('inbox')}
            className="saas-card p-4 cursor-pointer hover:border-purple-300 transition bg-purple-50/20"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-purple-700">Corporate Deals</span>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-800">{stats.corporateLeads}</div>
            <div className="text-[11px] text-purple-600 mt-1">~175 prospective seats</div>
          </div>

          {/* Overdue Follow-ups */}
          <div
            onClick={() => onNavigate('follow-ups')}
            className="saas-card p-4 cursor-pointer hover:border-amber-300 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-amber-800">48h SLA Overdue</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{stats.overdueCount}</div>
            <div className="text-[11px] text-amber-600 mt-1">Uncontacted &gt; 48h</div>
          </div>

          {/* Duplicate Contacts */}
          <div
            onClick={() => onNavigate('contacts')}
            className="saas-card p-4 cursor-pointer hover:border-blue-300 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-700">Repeat Contacts</span>
              <Users2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.duplicateCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Rafi Ahmed (2 messages)</div>
          </div>

          {/* Spam Filtered */}
          <div
            onClick={() => onNavigate('inbox')}
            className="saas-card p-4 cursor-pointer hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Spam Filtered</span>
              <Ban className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-500">{stats.spamCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Filtered from pipeline</div>
          </div>
        </div>
      </div>

      {/* Sales Pipeline Funnel Strip */}
      <div className="saas-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              CRM Pipeline Funnel (5 Stages)
            </h4>
            <p className="text-xs text-slate-500">Real-time status progression of active leads</p>
          </div>
          <button
            onClick={() => onNavigate('pipeline')}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Open Pipeline Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { stage: 'New', count: getStatusCount('New'), color: 'bg-blue-600', text: 'text-blue-700' },
            { stage: 'Contacted', count: getStatusCount('Contacted'), color: 'bg-amber-500', text: 'text-amber-700' },
            { stage: 'Interested', count: getStatusCount('Interested'), color: 'bg-purple-600', text: 'text-purple-700' },
            { stage: 'Paid', count: getStatusCount('Paid'), color: 'bg-emerald-600', text: 'text-emerald-700' },
            { stage: 'Lost', count: getStatusCount('Lost'), color: 'bg-slate-400', text: 'text-slate-600' },
          ].map((item, idx) => (
            <div
              key={item.stage}
              onClick={() => onNavigate('pipeline')}
              className="p-3 rounded-lg bg-slate-50/70 hover:bg-slate-100 border border-slate-100 cursor-pointer transition text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="font-medium text-slate-700">{item.stage}</span>
                <span className="text-[10px] text-slate-400">Step {idx + 1}</span>
              </div>
              <div className={`text-xl font-bold ${item.text}`}>{item.count}</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${item.color}`}
                  style={{ width: `${Math.min(100, (item.count / Math.max(1, stats.total)) * 100 * 2.5)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Urgent Queue + Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Priority Attention Queue */}
        <div className="lg:col-span-7 space-y-6">
          <div className="saas-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Critical Priority Queue ({urgentQueue.length})
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">Action recommendations generated by AI</span>
            </div>

            <div className="space-y-2.5">
              {urgentQueue.map((enquiry) => (
                <div
                  key={enquiry.id}
                  onClick={() => onSelectEnquiry(enquiry)}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white cursor-pointer transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{enquiry.name}</span>
                      {enquiry.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-0.5">
                          <PhoneCall className="w-3 h-3" /> {enquiry.phone}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          enquiry.priority === 'Urgent' ? 'badge-priority-urgent' : 'badge-priority-high'
                        }`}
                      >
                        {enquiry.priority}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-medium badge-cat-corporate">
                        {enquiry.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {enquiry.ai_summary || enquiry.original_message}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        {getChannelIcon(enquiry.channel)} {enquiry.channel}
                      </span>
                      <span>•</span>
                      <span>{enquiry.received_at}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <button className="btn-secondary text-xs py-1 px-2.5">Resolve →</button>
                  </div>
                </div>
              ))}

              {urgentQueue.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
                  All critical priority enquiries have been addressed!
                </div>
              )}
            </div>
          </div>

          {/* AI Executive Intelligence Brief Panel */}
          <div className="saas-card p-5 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  AI Operations Brief & Strategic Recommendations
                </h4>
              </div>
              <button
                onClick={onRefreshSummary}
                disabled={isLoadingSummary}
                className="btn-subtle text-xs flex items-center gap-1"
                title="Regenerate brief with Google Gemini"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSummary ? 'animate-spin' : ''}`} />
                <span>{isLoadingSummary ? 'Analyzing...' : 'Regenerate Brief'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3 leading-relaxed max-h-96 overflow-y-auto pr-2 bg-slate-50/70 p-4 rounded-lg border border-slate-100 font-sans">
              {weeklySummary ? (
                <div
                  className="prose prose-xs max-w-none text-slate-700 space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: weeklySummary
                      .replace(/^## (.*$)/gim, '<h5 class="text-xs font-bold text-slate-900 mt-3 mb-1 uppercase tracking-wider">$1</h5>')
                      .replace(/^### (.*$)/gim, '<h6 class="text-xs font-semibold text-slate-800 mt-2 mb-0.5">$1</h6>')
                      .replace(/^\* (.*$)/gim, '<div class="flex items-start gap-1.5 my-0.5"><span class="text-blue-600">•</span><span>$1</span></div>')
                      .replace(/^- (.*$)/gim, '<div class="flex items-start gap-1.5 my-0.5"><span class="text-blue-600">•</span><span>$1</span></div>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>'),
                  }}
                />
              ) : (
                <div className="text-slate-400 text-center py-4">Click Regenerate Brief to compile AI report.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Distribution Charts & Breakdowns */}
        <div className="lg:col-span-5 space-y-6">
          {/* Channel Distribution */}
          <div className="saas-card p-5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Acquisition Channels
            </h4>
            <p className="text-xs text-slate-400 mb-4">Inbound volume across BIAI platforms</p>

            <div className="space-y-3">
              {stats.byChannel.map((ch) => {
                const pct = Math.round((ch.count / Math.max(1, stats.total)) * 100);
                return (
                  <div key={ch.channel} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        {getChannelIcon(ch.channel)}
                        {ch.channel}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {ch.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="saas-card p-5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Smart Triage Breakdown
            </h4>
            <p className="text-xs text-slate-400 mb-4">Intent classification by AI engine</p>

            <div className="space-y-2.5">
              {stats.byCategory.map((cat) => {
                const count = cat.count;
                let badgeClass = 'badge-cat-general';
                if (cat.category === 'Corporate Lead') badgeClass = 'badge-cat-corporate';
                if (cat.category === 'Sales') badgeClass = 'badge-cat-sales';
                if (cat.category === 'Support') badgeClass = 'badge-cat-support';
                if (cat.category === 'Spam') badgeClass = 'badge-cat-spam';
                if (cat.category === 'Job Application') badgeClass = 'badge-cat-job';

                return (
                  <div
                    key={cat.category}
                    onClick={() => onNavigate('inbox')}
                    className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer transition text-xs"
                  >
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badgeClass}`}>
                      {cat.category || 'General Inquiry'}
                    </span>
                    <span className="font-semibold text-slate-700">{count} leads</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Program / Course Interest */}
          <div className="saas-card p-5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-1">
              Course & Offering Demand
            </h4>
            <p className="text-xs text-slate-400 mb-3">Programs enquired by prospective students</p>

            <div className="space-y-2 text-xs">
              {stats.byInterest.map((item) => (
                <div key={item.interest} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <span className="text-slate-700 font-medium">{item.interest}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    {item.count} inquiries
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Log */}
          <div className="saas-card p-5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Recent Activity Trail
            </h4>
            <div className="space-y-2 text-xs">
              {stats.recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2 py-1 text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium truncate">{act.details}</p>
                    <p className="text-[10px] text-slate-400">{act.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
