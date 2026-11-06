'use client';

import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function QuickAddModal({ isOpen, onClose, onCreated }: QuickAddModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState('WhatsApp');
  const [interest, setInterest] = useState('Bootcamp');
  const [category, setCategory] = useState('Sales');
  const [priority, setPriority] = useState('Normal');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      alert('Please provide customer name and message content.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          channel,
          interest,
          category,
          priority,
          status: 'New',
          message: message.trim(),
          ai_summary: `Manual intake via ${channel}: ${message.substring(0, 80)}...`,
          received_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }),
      });

      if (!res.ok) throw new Error('Failed to create enquiry');
      onCreated();
      onClose();
      // Reset
      setName('');
      setPhone('');
      setMessage('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating enquiry';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 drawer-backdrop animate-fadeIn" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 z-10 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create New Enquiry</h3>
              <p className="text-[11px] text-slate-500">Add an incoming customer record</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Customer / Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanvir Ahmed"
                className="input-base text-xs py-1.5"
              />
            </div>
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01711000000"
                className="input-base text-xs py-1.5 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Source</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="input-base text-xs py-1.5"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Website form">Website Form</option>
                <option value="Facebook Messenger">FB Messenger</option>
                <option value="Facebook comment">FB Comment</option>
                <option value="Phone call note">Phone Call</option>
                <option value="Walk-in">Walk-in Visit</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-base text-xs py-1.5"
              >
                <option value="Sales">Sales</option>
                <option value="Corporate Lead">Corporate Lead</option>
                <option value="Support">Support</option>
                <option value="Job Application">Job Application</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Offering</label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="input-base text-xs py-1.5"
              >
                <option value="Bootcamp">Bootcamp</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Corporate Training">Corporate</option>
                <option value="Masterclass">Masterclass</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input-base text-xs py-1.5"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-semibold block mb-1">Customer Message / Inquiry Notes *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did the customer ask? (Bangla, Banglish, English)..."
              className="input-base text-xs leading-relaxed font-sans"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="btn-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Create Enquiry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
