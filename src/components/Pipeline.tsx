'use client';

import React from 'react';
import {
  MessageSquare,
  Globe,
  Share2,
  Phone,
  Inbox,
} from 'lucide-react';
import { Enquiry } from './SmartInbox';

interface PipelineProps {
  enquiries: Enquiry[];
  onSelectEnquiry: (enquiry: Enquiry) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const STAGES = [
  { id: 'New', label: 'New Inbound', color: 'border-t-blue-600', badge: 'bg-blue-50 text-blue-700' },
  { id: 'Contacted', label: 'Contacted', color: 'border-t-amber-500', badge: 'bg-amber-50 text-amber-700' },
  { id: 'Interested', label: 'Interested / In Discovery', color: 'border-t-purple-600', badge: 'bg-purple-50 text-purple-700' },
  { id: 'Paid', label: 'Paid / Enrolled', color: 'border-t-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
  { id: 'Lost', label: 'Lost / Closed', color: 'border-t-slate-400', badge: 'bg-slate-100 text-slate-600' },
];

export default function Pipeline({
  enquiries,
  onSelectEnquiry,
  onUpdateStatus,
}: PipelineProps) {
  // Exclude Spam and Job Applications from the pure Sales Pipeline
  const pipelineLeads = enquiries.filter(
    (e) => !e.is_spam && e.category !== 'Spam' && e.category !== 'Job Application'
  );

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    const id = parseInt(idStr, 10);
    if (!isNaN(id)) {
      onUpdateStatus(id, targetStage);
    }
  };

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'WhatsApp':
        return <MessageSquare className="w-3 h-3 text-emerald-600" />;
      case 'Website form':
        return <Globe className="w-3 h-3 text-blue-600" />;
      case 'Facebook Messenger':
      case 'Facebook comment':
        return <Share2 className="w-3 h-3 text-indigo-600" />;
      case 'Phone call note':
        return <Phone className="w-3 h-3 text-amber-600" />;
      default:
        return <Inbox className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Pipeline Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white saas-card p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Sales & Enrolment Pipeline Board
          </h3>
          <p className="text-xs text-slate-500">
            {pipelineLeads.length} active leads • Drag and drop cards between stages or use quick-selector
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Stages:</span>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">New</span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">Contacted</span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">Interested</span>
          <span>→</span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">Paid</span>
        </div>
      </div>

      {/* 5 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {STAGES.map((stage) => {
          const stageCards = pipelineLeads.filter((e) => e.status === stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/80 min-h-[550px] flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {stage.label}
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${stage.badge}`}>
                  {stageCards.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
                {stageCards.map((enquiry) => {
                  const isCorporate = enquiry.category === 'Corporate Lead';

                  return (
                    <div
                      key={enquiry.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, enquiry.id)}
                      onClick={() => onSelectEnquiry(enquiry)}
                      className={`saas-card-interactive p-3 cursor-grab active:cursor-grabbing bg-white border-l-4 ${
                        isCorporate ? 'border-l-purple-600' : 'border-l-blue-600'
                      }`}
                    >
                      {/* Top Card Info */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="font-semibold text-xs text-slate-900 line-clamp-1 hover:text-blue-700">
                          {enquiry.name}
                        </span>

                        {enquiry.priority === 'Urgent' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-red-100 text-red-700">
                            Urgent
                          </span>
                        )}
                      </div>

                      {/* Summary or Snippet */}
                      <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed font-sans">
                        {enquiry.ai_summary || enquiry.original_message}
                      </p>

                      {/* Card Meta Badges */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          {getChannelIcon(enquiry.channel)}
                          <span>{enquiry.channel.replace('Facebook ', 'FB ')}</span>
                        </span>

                        {enquiry.interest && (
                          <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {enquiry.interest}
                          </span>
                        )}
                      </div>

                      {/* Quick stage selector dropdown */}
                      <div
                        className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-slate-400 font-mono">{enquiry.received_at.split(' ')[0]}</span>

                        <select
                          value={enquiry.status}
                          onChange={(e) => onUpdateStatus(enquiry.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-1.5 py-0.5 text-[10px] font-medium focus:outline-none"
                        >
                          <option value="New">Move: New</option>
                          <option value="Contacted">Move: Contacted</option>
                          <option value="Interested">Move: Interested</option>
                          <option value="Paid">Move: Paid</option>
                          <option value="Lost">Move: Lost</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {stageCards.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs text-center p-3">
                    Drag leads here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
