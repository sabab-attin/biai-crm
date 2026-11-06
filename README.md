# BIAI CRM — Enterprise AI Operations & Customer Intelligence System

A production-quality B2B SaaS CRM built for **BIAI (Bangladesh Institute of AI)** to solve multi-channel enquiry fragmentation, prevent leads from getting lost, automate intelligent triage, and empower admissions & sales teams with actionable AI.

Designed with a restrained, high-density **Linear / Attio aesthetic** (clean light theme, crisp typography, semantic indicators, zero visual clutter).

---

## ⚡ Quickstart Guide

### 1. Requirements
- Node.js (v18, v20, or v22+)
- npm or pnpm

### 2. Installation & Running
The CRM is located in `d:\biai\biai-crm` (or your cloned repository root):

```bash
cd biai-crm

# 1. Install dependencies (if not already installed)
npm install

# 2. Run the application
# For development mode with hot reload:
npm run dev

# Or for optimized production server:
npm run build
npm run start
```

Open **`http://localhost:3000`** in your browser.

---

## 🔑 Google AI Studio API Setup

The CRM is designed to use **Google AI Studio's Free Tier Gemini API** (`gemini-2.0-flash` or `gemini-1.5-flash`).

### Option A: Via Application UI (Recommended)
1. Open the CRM at `http://localhost:3000`.
2. In the bottom-left sidebar, click **"API Key Config"**.
3. Paste your Gemini API key (from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)) and click **"Save API Key"**.
4. The key will be securely saved into `.env.local` and activated immediately.

### Option B: Via `.env.local` File
Create or edit `.env.local` in `biai-crm/`:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key_here
```
Restart the server.

> **Resilient Fallback Engine:** If an API key is not configured or if you exceed Google AI Studio rate limits, the CRM seamlessly activates a deterministic Bangladesh-tailored NLP triage engine so that you can demonstrate all features (triage, Bangla/Banglish replies, duplicate merging, follow-up SLA) without service interruption!

---

## 🎯 Key Features & Differentiators

### 1. AI Smart Triage System
Unlike generic forms that treat all enquiries identically, BIAI CRM automatically categorizes inbound inquiries into operational buckets:
- **Corporate Leads (B2B)**: e.g. Motijheel Bank requesting quotes for 120 employees, Gazipur textile company with 40 staff, garment factory with 15 workers.
- **Urgent Support & Retention**: e.g. Habibur Rahman demanding an enrolment cancellation and refund, Farzana Rahman verifying a completed bKash transfer.
- **Active Sales Pipeline**: Prospective students asking for bootcamp dates, fees, and instalment options.
- **Careers & Internships**: Applicants asking where to submit an AI intern CV (routed to HR).
- **Spam Filtering**: Crypto bots and external promotions automatically filtered out of the sales pipeline.

### 2. Customer 360° Profile & Smart Duplicate Detection
Addresses the real problem found in the official sample dataset:
- **Rafi Ahmed** appears in **Enquiry #1** (Oct 26, 09:12 via WhatsApp) and **Enquiry #12** (Oct 27, 09:05 via WhatsApp) with the same phone number `01711000001`.
- The CRM automatically links both inquiries into a **consolidated Customer 360° record** while preserving the full text and timestamp history of each individual message.

### 3. Follow-up SLA & 48-Hour Alert Queue
Directly addresses BIAI's core operational problem: *"enquiries are coming from multiple channels, some get lost, and nobody can clearly see who needs attention."*
- Monitors elapsed time since each enquiry was received.
- Automatically flags all enquiries exceeding **48 hours without a recorded response**.
- Allows employees to 1-click **"Mark Contacted"** or open the drawer to draft an immediate follow-up.

### 4. Multilingual Reply Studio
- Formats replies in **English**, **Bangla (বাংলা লিপি)**, or everyday **Banglish** (Latin Bengali).
- Three professional tones: **Formal**, **Friendly**, and **Concise**.
- Includes approved BIAI knowledge (Bootcamp ৳4,500, Fellowship 2-instalment option, official bKash reconciliation, custom enterprise training).
- One-click copy to clipboard + records sent responses to the customer timeline.

### 5. Explainable AI & Action Recommendations
- **Explainable AI**: Displays why a classification was made (e.g. *"Client explicitly mentioned 120 employees and requested corporate quotation"*).
- **Next Action Checklist**: AI suggests actionable steps (e.g., *"Assign corporate sales representative"*, *"Schedule discovery call this week"*).

### 6. Human-in-the-Loop AI Feedback Quality Tracker
- Allows employees to correct an AI classification directly inside the enquiry drawer.
- Stores the original prediction and human correction in the `ai_feedback` database table for ongoing evaluation and prompt engineering.

### 7. 5-Stage Kanban Sales Pipeline
- Interactive stages: **New → Contacted → Interested → Paid → Lost**.
- Drag-and-drop support plus accessible status dropdown on every lead card.
- Filters out spam and non-sales complaints to keep the sales team focused on real business.

---

## 🗄️ Database Architecture (SQLite with WAL)

The CRM uses a persistent, high-performance SQLite database (`data/crm.db`) via `better-sqlite3`:

```
┌──────────────┐       1:N       ┌──────────────┐
│   contacts   │ ──────────────< │  enquiries   │
└──────────────┘                 └──────────────┘
       │                                │
       │ 1:N                            │ 1:N
       ▼                                ▼
┌──────────────┐                 ┌──────────────┐
│ activity_log │                 │   replies    │
└──────────────┘                 └──────────────┘
                                        │
                                        │ 1:N
                                        ▼
                                 ┌──────────────┐
                                 │ ai_feedback  │
                                 └──────────────┘
```

---

## 📹 5-Minute Loom Video Guide (For Submission)

When recording your Loom video for the BIAI Hiring Team, follow this tested 5-minute script:

1. **Introduction (30s):**
   - Introduce yourself and state the problem: BIAI gets enquiries from WhatsApp, Facebook, Website, and phone notes. Leads get lost, spam clutters the pipeline, and response times lag.
   - Present your core thesis: *"A CRM should instantly answer: Which customer needs our attention right now, and what should we do about them?"*

2. **Dashboard & Smart Triage (1m 15s):**
   - Show the Executive Summary: 20 sample enquiries triaged into 3 Corporate Deals, 2 Urgent Support cases, 1 Spam, and 12 Sales Leads.
   - Point out the **Critical Priority Queue**: show Habibur Rahman's refund complaint and Kamrul Islam's 120-employee bank request.

3. **Customer 360° & Duplicate Detection (1m):**
   - Go to **Smart Inbox** or **Customer 360°**.
   - Show **Rafi Ahmed** (phone `01711000001`): point out how Inquiry #1 and #12 are linked under one profile with complete message history preserved.

4. **AI Assistant & Multilingual Reply Studio (1m 15s):**
   - Switch to **AI Assistant**.
   - Click one of the test buttons (e.g. Bangla or Banglish sample).
   - Click **"Analyse & Extract with AI"**: show the extracted fields, Explainable AI reasoning, and Recommended Next Actions.
   - Generate a reply in Bangla or Banglish, copy to clipboard, and save to CRM.

5. **Follow-up SLA & Conclusion (1m):**
   - Show the **48-Hour SLA Manager** with overdue enquiries.
   - Show how changing a stage to "Contacted" or "Paid" updates the pipeline.
   - Conclude confidently with why BIAI's team would comfortably use this every day.

---

## 📝 Half-Page Submission Note (Task Deliverable #4)

> **What was built:**
> An end-to-end CRM and AI operations system for BIAI built with Next.js 16 (App Router, TypeScript, Tailwind CSS v4) and SQLite (`better-sqlite3`). It incorporates an AI Smart Triage engine, Customer 360° identity consolidation (resolving duplicate leads like Rafi Ahmed), a 48-hour response SLA tracker, an interactive 5-stage sales pipeline (New, Contacted, Interested, Paid, Lost), an AI Message Extraction Studio, and a Multilingual Reply Composer (supporting Bangla, Banglish, and English with tone controls).
>
> **AI tools used and how:**
> - **Google AI Studio (Gemini 2.0 Flash API):** Used for structured intent extraction, sentiment analysis, explainable classification reasoning, action recommendations, weekly executive briefings, and contextual response generation in Bengali, Banglish, and English.
> - **Local Knowledge Fallback Engine:** Built directly into the backend to provide zero-downtime deterministic heuristics if the API key is not configured or during Google AI Studio rate limits.
> - **Human-in-the-Loop Feedback Loop:** An `ai_feedback` table logs human overrides to evaluate model performance without retraining.
>
> **What does not work yet / current limitations:**
> Direct API webhooks to WhatsApp Business API and Meta Graph API are simulated via pasted message ingestion rather than live bi-directional socket connections. Email dispatch is simulated via clipboard copying and internal timeline logging.
>
> **What I would fix / implement next:**
> 1. Webhook endpoints for WhatsApp Cloud API and Facebook Page Messenger for automatic zero-click ingestion.
> 2. Automated SMS notification to the Managing Director whenever a high-value enterprise lead (>50 employees) or urgent refund threat arrives.
> 3. Fine-tuning prompt templates using accumulated records from the `ai_feedback` table.
