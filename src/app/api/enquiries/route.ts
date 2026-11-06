import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');
    const channel = searchParams.get('channel');
    const language = searchParams.get('language');

    let query = `
      SELECT e.*, c.name, c.phone, c.email
      FROM enquiries e
      LEFT JOIN contacts c ON e.contact_id = c.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (status && status !== 'all') {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (category && category !== 'all') {
      query += ' AND e.category = ?';
      params.push(category);
    }
    if (priority && priority !== 'all') {
      query += ' AND e.priority = ?';
      params.push(priority);
    }
    if (channel && channel !== 'all') {
      query += ' AND e.channel = ?';
      params.push(channel);
    }
    if (language && language !== 'all') {
      query += ' AND e.language = ?';
      params.push(language);
    }
    if (search) {
      query += ' AND (c.name LIKE ? OR e.original_message LIKE ? OR c.phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY e.received_at DESC';

    const enquiries = db.prepare(query).all(...params);
    return NextResponse.json(enquiries);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    const {
      name, phone, email, channel, received_at, message,
      interest, category, priority, language, status,
      ai_summary, ai_classification_reason, ai_recommended_actions,
      ai_confidence, is_spam
    } = body;

    // Find or create contact
    let contactId: number;
    if (phone) {
      const existing = db.prepare('SELECT id FROM contacts WHERE phone = ?').get(phone) as { id: number } | undefined;
      if (existing) {
        contactId = existing.id;
      } else {
        const result = db.prepare('INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)').run(name, phone, email || null);
        contactId = result.lastInsertRowid as number;
      }
    } else {
      const result = db.prepare('INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)').run(name, null, email || null);
      contactId = result.lastInsertRowid as number;
    }

    // Check for duplicate enquiry
    let isDuplicate = 0;
    let duplicateOf = null;
    if (phone) {
      const existingEnquiry = db.prepare(
        'SELECT e.id FROM enquiries e JOIN contacts c ON e.contact_id = c.id WHERE c.phone = ? ORDER BY e.received_at DESC LIMIT 1'
      ).get(phone) as { id: number } | undefined;
      if (existingEnquiry) {
        isDuplicate = 1;
        duplicateOf = existingEnquiry.id;
      }
    }

    const result = db.prepare(`
      INSERT INTO enquiries (
        contact_id, channel, received_at, original_message, language,
        interest, category, priority, status, ai_summary,
        ai_classification_reason, ai_recommended_actions, ai_confidence,
        is_spam, is_duplicate, duplicate_of
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      contactId, channel || 'Manual', received_at || new Date().toISOString(),
      message, language || 'English', interest || 'General',
      category || 'General Inquiry', priority || 'Normal',
      status || 'New', ai_summary || null,
      ai_classification_reason || null,
      ai_recommended_actions ? JSON.stringify(ai_recommended_actions) : null,
      ai_confidence || 0, is_spam ? 1 : 0, isDuplicate, duplicateOf
    );

    // Log activity
    db.prepare('INSERT INTO activity_log (enquiry_id, contact_id, action, details) VALUES (?, ?, ?, ?)').run(
      result.lastInsertRowid, contactId, 'created', `New enquiry from ${channel || 'manual entry'}`
    );

    return NextResponse.json({
      id: result.lastInsertRowid,
      contact_id: contactId,
      is_duplicate: isDuplicate,
      duplicate_of: duplicateOf,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
