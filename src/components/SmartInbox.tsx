'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Globe,
  Share2,
  Phone,
  Inbox,
  Ban,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
  Users2,
  X,
} from 'lucide-react';

export interface Enquiry {
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
}

interface SmartInboxProps {
  enquiries: Enquiry[];
  onSelectEnquiry: (enquiry: Enquiry) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onRefresh: () => void;
  searchQuery: string;
  initialSegment?: 'all' | 'urgent';
}

const PRIORITY_WEIGHT: Record<string, number> = {
  Urgent: 0,
  High: 1,
  Normal: 2,
  Low: 3,
};

export default function SmartInbox({
  enquiries,
  onSelectEnquiry,
  onUpdateStatus,
  searchQuery,
  initialSegment = 'all',
}: SmartInboxProps) {
  // Smart Triage segmented tabs
  const [activeSegment, setActiveSegment] = useState<'all' | 'urgent' | 'corporate' | 'sales' | 'support' | 'spam'>(initialSegment);

  useEffect(() => {
    setActiveSegment(initialSegment);
  }, [initialSegment]);

  // Multi-dimensional filters
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'priority'>('date-desc');

  const effectiveSearch = searchQuery || localSearch;

  // Segment counts
  const urgentCount = enquiries.filter((e) => e.priority === 'Urgent').length;
  const salesCount = enquiries.filter((e) => e.category === 'Sales').length;
  const supportCount = enquiries.filter((e) => e.category === 'Support').length;
  const spamCount = enquiries.filter((e) => e.is_spam === 1 || e.category === 'Spam').length;

  // Filter pipeline
  const filteredEnquiries = useMemo(() => {
    let list = [...enquiries];

    // Segment filter
    if (activeSegment === 'urgent') {
      list = list.filter((e) => e.priority === 'Urgent');
    } else if (activeSegment === 'corporate') {
      list = list.filter((e) => e.category === 'Corporate Lead');
    } else if (activeSegment === 'sales') {
      list = list.filter((e) => e.category === 'Sales');
    } else if (activeSegment === 'support') {
      list = list.filter((e) => e.category === 'Support');
    } else if (activeSegment === 'spam') {
      list = list.filter((e) => e.is_spam === 1 || e.category === 'Spam');
    }

    // Secondary dropdown filters
    if (filterChannel !== 'all') {
      list = list.filter((e) => e.channel === filterChannel);
    }
    if (filterCategory !== 'all') {
      list = list.filter((e) => e.category === filterCategory);
    }
    if (filterPriority !== 'all') {
      list = list.filter((e) => e.priority === filterPriority);
    }
    if (filterStatus !== 'all') {
      list = list.filter((e) => e.status === filterStatus);
    }
    if (filterLanguage !== 'all') {
      list = list.filter((e) => e.language?.toLowerCase() === filterLanguage.toLowerCase());
    }

    // Search query
    if (effectiveSearch.trim()) {
      const q = effectiveSearch.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.phone?.includes(q) ||
          e.original_message?.toLowerCase().includes(q) ||
          e.ai_summary?.toLowerCase().includes(q) ||
          e.interest?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'priority') {
      list.sort((a, b) => (PRIORITY_WEIGHT[a.priority] ?? 99) - (PRIORITY_WEIGHT[b.priority] ?? 99));
    } else if (sortBy === 'date-asc') {
      list.sort((a, b) => new Date(a.received_at).getTime() - new Date(b.received_at).getTime());
    } else {
      list.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
    }

    return list;
  }, [
    enquiries,
    activeSegment,
    filterChannel,
    filterCategory,
    filterPriority,
    filterStatus,
    filterLanguage,
    effectiveSearch,
    sortBy,
  ]);

  const resetFilters = () => {
    setActiveSegment('all');
    setFilterChannel('all');
    setFilterCategory('all');
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterLanguage('all');
    setLocalSearch('');
  };

  const hasActiveFilters =
    activeSegment !== 'all' ||
    filterChannel !== 'all' ||
    filterCategory !== 'all' ||
    filterPriority !== 'all' ||
    filterStatus !== 'all' ||
    filterLanguage !== 'all' ||
    Boolean(effectiveSearch);

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case 'WhatsApp':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp
          </span>
        );
      case 'Website form':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Globe className="w-3 h-3 text-blue-600" /> Website
          </span>
        );
      case 'Facebook Messenger':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            <Share2 className="w-3 h-3 text-indigo-600" /> Messenger
          </span>
        );
      case 'Facebook comment':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            <Share2 className="w-3 h-3 text-indigo-600" /> FB Comment
          </span>
        );
      case 'Phone call note':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Phone className="w-3 h-3 text-amber-600" /> Phone Call
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            <Inbox className="w-3 h-3 text-slate-500" /> {ch}
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Corporate Lead':
        return <span className="badge-cat-corporate text-[11px] px-2 py-0.5 rounded font-medium">Corporate</span>;
      case 'Support':
        return <span className="badge-cat-support text-[11px] px-2 py-0.5 rounded font-medium">Support & Refunds</span>;
      case 'Sales':
        return <span className="badge-cat-sales text-[11px] px-2 py-0.5 rounded font-medium">Sales</span>;
      case 'Spam':
        return <span className="badge-cat-spam text-[11px] px-2 py-0.5 rounded font-medium">Spam</span>;
      case 'Job Application':
        return <span className="badge-cat-job text-[11px] px-2 py-0.5 rounded font-medium">Careers / Intern</span>;
      default:
        return <span className="badge-cat-general text-[11px] px-2 py-0.5 rounded font-medium">{cat || 'Inquiry'}</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'Urgent':
        return <span className="badge-priority-urgent text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Urgent</span>;
      case 'High':
        return <span className="badge-priority-high text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">High</span>;
      case 'Normal':
        return <span className="badge-priority-normal text-[10px] px-1.5 py-0.5 rounded font-medium">Normal</span>;
      case 'Low':
        return <span className="badge-priority-low text-[10px] px-1.5 py-0.5 rounded font-medium">Low</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'New':
        return 'badge-status-new';
      case 'Contacted':
        return 'badge-status-contacted';
      case 'Interested':
        return 'badge-status-interested';
      case 'Paid':
        return 'badge-status-paid';
      case 'Lost':
        return 'badge-status-lost';
      default:
        return 'badge-status-new';
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Smart Triage Segmented Queue Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-lg max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveSegment('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeSegment === 'all'
              ? 'bg-white text-slate-900 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Enquiries ({enquiries.length})
        </button>

        <button
          onClick={() => setActiveSegment('urgent')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeSegment === 'urgent'
              ? 'bg-white text-red-700 shadow-sm font-bold'
              : 'text-slate-600 hover:text-red-700'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
          Urgent Attention ({urgentCount})
        </button>

        <button
          onClick={() => setActiveSegment('sales')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeSegment === 'sales'
              ? 'bg-white text-emerald-800 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-emerald-800'
          }`}
        >
          Sales Pipeline ({salesCount})
        </button>

        <button
          onClick={() => setActiveSegment('support')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeSegment === 'support'
              ? 'bg-white text-amber-800 shadow-sm font-semibold'
              : 'text-slate-600 hover:text-amber-800'
          }`}
        >
          Support & Refunds ({supportCount})
        </button>

        <button
          onClick={() => setActiveSegment('spam')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
            activeSegment === 'spam'
              ? 'bg-white text-slate-700 shadow-sm font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ban className="w-3.5 h-3.5 text-slate-400" />
          Spam / Filtered ({spamCount})
        </button>
      </div>

      {/* Filter and Control Bar */}
      <div className="saas-card p-3 flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel dropdown */}
          <select
            value={filterChannel}
            onChange={(e) => setFilterChannel(e.target.value)}
            className="input-base text-xs py-1.5 px-2.5 w-auto"
          >
            <option value="all">All Channels</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Website form">Website form</option>
            <option value="Facebook Messenger">Facebook Messenger</option>
            <option value="Facebook comment">Facebook comment</option>
            <option value="Phone call note">Phone call note</option>
          </select>

          {/* Category dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-base text-xs py-1.5 px-2.5 w-auto"
          >
            <option value="all">All Categories</option>
            <option value="Corporate Lead">Corporate Lead</option>
            <option value="Sales">Sales</option>
            <option value="Support">Support</option>
            <option value="Job Application">Job Application</option>
            <option value="Spam">Spam</option>
          </select>

          {/* Priority dropdown */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-base text-xs py-1.5 px-2.5 w-auto"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          {/* Sales Status dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-base text-xs py-1.5 px-2.5 w-auto"
          >
            <option value="all">All CRM Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Paid">Paid</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Language dropdown */}
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="input-base text-xs py-1.5 px-2.5 w-auto"
          >
            <option value="all">All Languages</option>
            <option value="Bangla">Bangla (বাংলা)</option>
            <option value="Banglish">Banglish</option>
            <option value="English">English</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn-subtle text-xs text-red-600 hover:text-red-700 py-1 px-2"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'priority')}
              className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest Received</option>
              <option value="date-asc">Oldest Received</option>
              <option value="priority">Priority First</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {filteredEnquiries.length} results
          </span>
        </div>
      </div>

      {/* Main Inbox Table List */}
      <div className="saas-card overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Inbox className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <h5 className="text-sm font-semibold text-slate-700">No enquiries match current filters</h5>
            <p className="text-xs text-slate-400 mt-1">Try resetting filters or modifying your search query.</p>
            <button onClick={resetFilters} className="btn-secondary text-xs mt-4">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEnquiries.map((enquiry) => {
              const isDuplicate = enquiry.is_duplicate === 1;
              return (
                <div
                  key={enquiry.id}
                  onClick={() => onSelectEnquiry(enquiry)}
                  className={`p-4 hover:bg-slate-50/80 cursor-pointer transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    enquiry.priority === 'Urgent' ? 'bg-red-50/15' : ''
                  }`}
                >
                  {/* Left Column: Contact & Message */}
                  <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                    {/* Top Meta Line */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 hover:text-blue-700 transition">
                        {enquiry.name}
                      </span>

                      {enquiry.phone && (
                        <span className="text-xs text-slate-500 font-mono">
                          {enquiry.phone}
                        </span>
                      )}

                      {/* Source */}
                      {getChannelBadge(enquiry.channel)}

                      {/* Category */}
                      {getCategoryBadge(enquiry.category)}

                      {/* Priority */}
                      {getPriorityBadge(enquiry.priority)}

                      {/* Language */}
                      <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {enquiry.language}
                      </span>

                      {/* Duplicate Tag */}
                      {isDuplicate && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded"
                          title="Repeated enquiry from same phone number (Rafi Ahmed)"
                        >
                          <Users2 className="w-3 h-3 text-blue-600" /> Repeat Lead
                        </span>
                      )}
                    </div>

                    {/* AI Executive Summary */}
                    {enquiry.ai_summary && (
                      <p className="text-xs font-medium text-slate-900 flex items-center gap-1.5 line-clamp-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span>{enquiry.ai_summary}</span>
                      </p>
                    )}

                    {/* Original Message snippet */}
                    <p className="text-xs text-slate-500 line-clamp-1 italic font-sans">
                      &ldquo;{enquiry.original_message}&rdquo;
                    </p>
                  </div>

                  {/* Right Column: Status & Timestamp */}
                  <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {/* Course/Offering tag */}
                    {enquiry.interest && enquiry.interest !== 'General' && (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded hidden lg:inline">
                        {enquiry.interest}
                      </span>
                    )}

                    {/* Stage Dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={enquiry.status}
                        onChange={(e) => onUpdateStatus(enquiry.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none cursor-pointer ${getStatusBadge(
                          enquiry.status
                        )}`}
                      >
                        <option value="New">🔵 New</option>
                        <option value="Contacted">🟡 Contacted</option>
                        <option value="Interested">🟣 Interested</option>
                        <option value="Paid">🟢 Paid</option>
                        <option value="Lost">⚪ Lost</option>
                      </select>
                    </div>

                    {/* Timestamp */}
                    <div className="text-right">
                      <p className="text-xs text-slate-600 font-medium">{enquiry.received_at.split(' ')[0]}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{enquiry.received_at.split(' ')[1]}</p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
