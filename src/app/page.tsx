'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard, { DashboardStats } from '@/components/Dashboard';
import SmartInbox, { Enquiry } from '@/components/SmartInbox';
import Pipeline from '@/components/Pipeline';
import AIAssistant from '@/components/AIAssistant';
import CustomerDirectory from '@/components/CustomerDirectory';
import FollowUps from '@/components/FollowUps';
import InsightsView from '@/components/InsightsView';
import EnquiryDetailDrawer from '@/components/EnquiryDetailDrawer';
import QuickAddModal from '@/components/QuickAddModal';
import { RefreshCw } from 'lucide-react';

const defaultStats: DashboardStats = {
  total: 0,
  byStatus: [],
  byCategory: [],
  byChannel: [],
  byInterest: [],
  byPriority: [],
  corporateLeads: 0,
  spamCount: 0,
  duplicateCount: 0,
  urgentCount: 0,
  overdueCount: 0,
  recentActivity: [],
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  // Global search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [inboxSegment, setInboxSegment] = useState<'all' | 'urgent'>('all');

  // Modals & Drawers
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  // AI batch processor & weekly brief
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch all core CRM data
  const fetchData = useCallback(async () => {
    try {
      const [statsRes, enqRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/enquiries'),
      ]);

      if (statsRes.ok && enqRes.ok) {
        const statsData = await statsRes.json();
        const enqData = await enqRes.json();

        if (enqData.length === 0) {
          setIsSeeding(true);
          const seedRes = await fetch('/api/seed', { method: 'POST' });
          if (seedRes.ok) {
            const reStats = await fetch('/api/stats');
            const reEnq = await fetch('/api/enquiries');
            setStats(await reStats.json());
            setEnquiries(await reEnq.json());
          }
          setIsSeeding(false);
        } else {
          setStats(statsData);
          setEnquiries(enqData);
        }
      }
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch or generate AI weekly summary
  const fetchWeeklySummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch('/api/ai/summary', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.summary) setWeeklySummary(json.summary);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // Initial load via asynchronous effects
  useEffect(() => {
    let isMounted = true;

    Promise.all([fetch('/api/stats'), fetch('/api/enquiries')])
      .then(async ([statsRes, enqRes]) => {
        if (!isMounted) return;
        const statsData = await statsRes.json();
        const enqData = await enqRes.json();

        if (enqData.length === 0) {
          const seedRes = await fetch('/api/seed', { method: 'POST' });
          if (seedRes.ok) {
            const reStats = await fetch('/api/stats');
            const reEnq = await fetch('/api/enquiries');
            if (isMounted) {
              setStats(await reStats.json());
              setEnquiries(await reEnq.json());
            }
          }
        } else {
          if (isMounted) {
            setStats(statsData);
            setEnquiries(enqData);
          }
        }
        if (isMounted) setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    fetch('/api/settings')
      .then((r) => r.json())
      .then((j) => {
        if (isMounted) setApiKeyConfigured(j.configured);
      })
      .catch(() => {});

    fetch('/api/ai/summary', { method: 'POST' })
      .then((r) => r.json())
      .then((j) => {
        if (isMounted && j.summary) setWeeklySummary(j.summary);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Update enquiry status handler
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      // Optimistic update
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );

      const res = await fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update stage');
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating status';
      alert(msg);
      fetchData();
    }
  };

  // Run batch AI triage across all enquiries
  const handleProcessAllAI = async () => {
    setIsProcessingAI(true);
    try {
      const res = await fetch('/api/ai/process-all', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        await fetchWeeklySummary();
        alert('All enquiries successfully processed with smart AI triage!');
      } else {
        throw new Error('Batch processing returned an error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch processing error';
      alert(msg);
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Force re-seed database with clean sample dataset
  const handleReseed = async () => {
    if (!confirm('Reload the 20 official sample enquiries with clean initial state?')) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed?force=true', { method: 'POST' });
      if (res.ok) {
        await fetchData();
        await fetchWeeklySummary();
        alert('20 Sample enquiries successfully reloaded into CRM database!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Seeding error';
      alert(msg);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        stats={{
          total: stats.total,
          urgentCount: stats.urgentCount,
          corporateLeads: stats.corporateLeads,
          overdueCount: stats.overdueCount,
        }}
        onReseed={handleReseed}
        apiKeyConfigured={apiKeyConfigured}
        isSeeding={isSeeding}
      />

      {/* Main Content Area (offset by 64rem sidebar = 16rem = w-64) */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onProcessAllAI={handleProcessAllAI}
          isProcessingAI={isProcessingAI}
          urgentCount={stats.urgentCount}
          onUrgentClick={() => {
            setInboxSegment('urgent');
            setActiveTab('inbox');
          }}
        />

        {/* View Router */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span>Connecting to BIAI CRM Operations Database...</span>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  stats={stats}
                  enquiries={enquiries}
                  onNavigate={setActiveTab}
                  onSelectEnquiry={(e) => setSelectedEnquiryId(e.id)}
                  weeklySummary={weeklySummary}
                  onRefreshSummary={fetchWeeklySummary}
                  isLoadingSummary={isLoadingSummary}
                />
              )}

              {activeTab === 'inbox' && (
                <SmartInbox
                  enquiries={enquiries}
                  onSelectEnquiry={(e) => setSelectedEnquiryId(e.id)}
                  onUpdateStatus={handleUpdateStatus}
                  onRefresh={() => fetchData()}
                  searchQuery={searchQuery}
                  initialSegment={inboxSegment}
                />
              )}

              {activeTab === 'pipeline' && (
                <Pipeline
                  enquiries={enquiries}
                  onSelectEnquiry={(e) => setSelectedEnquiryId(e.id)}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}

              {activeTab === 'ai-assistant' && (
                <AIAssistant
                  onEnquiryCreated={() => {
                    fetchData();
                    setActiveTab('inbox');
                  }}
                  apiKeyConfigured={apiKeyConfigured}
                />
              )}

              {activeTab === 'contacts' && (
                <CustomerDirectory
                  enquiries={enquiries}
                  onSelectEnquiry={(e) => setSelectedEnquiryId(e.id)}
                />
              )}

              {activeTab === 'follow-ups' && (
                <FollowUps
                  enquiries={enquiries}
                  onSelectEnquiry={(e) => setSelectedEnquiryId(e.id)}
                  onUpdateStatus={handleUpdateStatus}
                  onRefresh={() => fetchData()}
                />
              )}

              {activeTab === 'insights' && (
                <InsightsView
                  enquiries={enquiries}
                  onRefresh={() => fetchData()}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Slide-over Enquiry Detail Drawer */}
      <EnquiryDetailDrawer
        enquiryId={selectedEnquiryId}
        onClose={() => setSelectedEnquiryId(null)}
        onUpdateStatus={handleUpdateStatus}
        onEnquiryUpdated={() => fetchData()}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreated={() => {
          fetchData();
          setActiveTab('inbox');
        }}
      />

    </div>
  );
}
