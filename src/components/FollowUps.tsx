'use client';

import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Globe,
  Share2,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { Enquiry } from './SmartInbox';

interface FollowUpsProps {
  enquiries: Enquiry[];
  onSelectEnquiry: (enquiry: Enquiry) => void;
  onUpdateStatus: (id: number, status: string) => void;
  onRefresh: () => void;
}

export default function FollowUps({
  enquiries,
  onSelectEnquiry,
  onRefresh,
}: FollowUpsProps) {
  const [markingId, setMarkingId] = useState<number | null>(null);

  // Inbound enquiries with no recorded last_follow_up
  const overdueEnquiries = enquiries.filter(
    (e) => !e.is_spam && e.status === 'New' && !e.last_follow_up
  );

  const inProgressEnquiries = enquiries.filter(
    (e) => e.status === 'Contacted' || e.status === 'Interested'
  );

  const completedEnquiries = enquiries.filter(
    (e) => e.status === 'Paid' || Boolean(e.last_follow_up)
  );

  const handleMarkFollowedUp = async (id: number) => {
    setMarkingId(id);
    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Contacted',
          last_follow_up: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update follow-up');
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating follow-up';
      alert(msg);
    } finally {
      setMarkingId(null);
    }
  };

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
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl">
      {/* 48-Hour SLA Alert Banner */}
      <div className="saas-card p-5 bg-amber-50/70 border-amber-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-950 tracking-tight">
              BIAI 48-Hour Response SLA Monitor
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed">
              Every inbound inquiry must receive an official response within 48 hours. Enquiries that linger in{' '}
              <span className="font-semibold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-amber-200">New</span> stage
              are flagged below for immediate outreach to avoid losing prospective students and enterprise deals.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="saas-card p-4 border-l-4 border-l-red-500 bg-white">
          <div className="text-xs text-slate-500 font-medium">Overdue SLA (&gt;48 Hours)</div>
          <div className="text-2xl font-bold text-red-700 mt-1">{overdueEnquiries.length} leads</div>
          <div className="text-[11px] text-red-600 mt-0.5">Need immediate dispatch</div>
        </div>

        <div className="saas-card p-4 border-l-4 border-l-amber-500 bg-white">
          <div className="text-xs text-slate-500 font-medium">In Active Follow-up</div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{inProgressEnquiries.length} leads</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Contacted or in discovery</div>
        </div>

        <div className="saas-card p-4 border-l-4 border-l-emerald-500 bg-white">
          <div className="text-xs text-slate-500 font-medium">Resolved / Enrolled</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{completedEnquiries.length} leads</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Follow-up recorded or paid</div>
        </div>
      </div>

      {/* Overdue Queue Section */}
      <div className="saas-card p-5 space-y-4 bg-white">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Critical Follow-up Required ({overdueEnquiries.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-400">Received &gt; 48h ago without reply</span>
        </div>

        <div className="divide-y divide-slate-100">
          {overdueEnquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-lg transition"
            >
              <div className="space-y-1 flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900">{enquiry.name}</span>
                  {enquiry.phone && (
                    <span className="text-xs text-slate-500 font-mono">{enquiry.phone}</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                    {getChannelIcon(enquiry.channel)} {enquiry.channel}
                  </span>
                  {enquiry.priority === 'Urgent' && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                      Urgent
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 font-medium line-clamp-1">
                  {enquiry.ai_summary || enquiry.original_message}
                </p>

                <p className="text-[11px] text-slate-400">
                  Received on <strong className="text-slate-600">{enquiry.received_at}</strong> • Offering:{' '}
                  <span className="text-blue-700 font-semibold">{enquiry.interest}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onSelectEnquiry(enquiry)}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <span>Review & Reply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleMarkFollowedUp(enquiry.id)}
                  disabled={markingId === enquiry.id}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{markingId === enquiry.id ? 'Updating...' : 'Mark Contacted'}</span>
                </button>
              </div>
            </div>
          ))}

          {overdueEnquiries.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              All customer enquiries have been contacted within the 48-hour SLA window!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
