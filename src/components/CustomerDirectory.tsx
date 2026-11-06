'use client';

import React, { useState } from 'react';
import {
  Users2,
  Phone,
  ChevronRight,
  Search,
} from 'lucide-react';
import { Enquiry } from './SmartInbox';

interface CustomerDirectoryProps {
  enquiries: Enquiry[];
  onSelectEnquiry: (enquiry: Enquiry) => void;
}

export default function CustomerDirectory({ enquiries, onSelectEnquiry }: CustomerDirectoryProps) {
  const [search, setSearch] = useState('');

  // Group enquiries by unique phone or name
  const customerMap = new Map<
    string,
    {
      primaryEnquiry: Enquiry;
      allEnquiries: Enquiry[];
      phone: string;
      name: string;
    }
  >();

  enquiries.forEach((e) => {
    // Unique key is phone if present, otherwise clean sender name
    const key = e.phone ? `phone:${e.phone}` : `name:${e.name.toLowerCase().trim()}`;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        primaryEnquiry: e,
        allEnquiries: [e],
        phone: e.phone,
        name: e.name,
      });
    } else {
      const existing = customerMap.get(key)!;
      existing.allEnquiries.push(e);
      // Prefer the more informative name
      if (e.name.length > existing.name.length) existing.name = e.name;
    }
  });

  const customerList = Array.from(customerMap.values()).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.allEnquiries.some((enq) => enq.original_message.toLowerCase().includes(q))
    );
  });

  // Sort duplicate / multi-enquiry customers first (e.g. Rafi Ahmed)
  customerList.sort((a, b) => b.allEnquiries.length - a.allEnquiries.length);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-6xl">
      {/* Banner */}
      <div className="saas-card p-5 bg-gradient-to-r from-blue-50/40 via-white to-purple-50/30 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users2 className="w-4 h-4 text-blue-700" />
              Customer 360° Identity Consolidation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unified view of {customerList.length} distinct individuals across 20 inbound messages
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold border border-blue-200">
              {customerList.filter((c) => c.allEnquiries.length > 1).length} Multi-Touch Customers
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="saas-card p-3 flex items-center gap-2 bg-white">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter customers by name, phone, or conversation topic..."
          className="w-full text-xs text-slate-900 bg-transparent focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600 px-1">
            ×
          </button>
        )}
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customerList.map((customer) => {
          const isMulti = customer.allEnquiries.length > 1;

          return (
            <div
              key={customer.phone || customer.name}
              onClick={() => onSelectEnquiry(customer.allEnquiries[0])}
              className={`saas-card-interactive p-4 bg-white cursor-pointer transition ${
                isMulti ? 'border-blue-300 ring-1 ring-blue-100' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      isMulti ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {customer.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{customer.name}</h4>
                      {isMulti && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          {customer.allEnquiries.length} Enquiries Linked
                        </span>
                      )}
                    </div>
                    {customer.phone && (
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>

              {/* Inquiries Timeline preview */}
              <div className="space-y-2 border-t border-slate-100 pt-2.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Communication History:
                </span>
                {customer.allEnquiries.map((enq, idx) => (
                  <div
                    key={enq.id}
                    className="p-2 rounded bg-slate-50 text-xs text-slate-700 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-600">
                        Message #{idx + 1} ({enq.channel})
                      </span>
                      <span>{enq.received_at}</span>
                    </div>
                    <p className="font-sans italic line-clamp-2">&ldquo;{enq.original_message}&rdquo;</p>
                  </div>
                ))}
              </div>

              {/* Footer status */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium text-blue-700">{customer.primaryEnquiry.interest}</span>
                <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  Status: {customer.primaryEnquiry.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
