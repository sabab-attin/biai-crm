import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { fallbackExtract } from '@/lib/ai';

export async function POST() {
  try {
    const db = getDb();
    const unprocessed = db.prepare(`
      SELECT e.id, e.original_message, e.channel, c.name, c.phone
      FROM enquiries e
      LEFT JOIN contacts c ON e.contact_id = c.id
      WHERE e.ai_summary IS NULL OR e.ai_summary = ''
    `).all() as Array<{
      id: number; original_message: string; channel: string; name: string; phone: string;
    }>;

    const results = [];

    for (const enquiry of unprocessed) {
      try {
        const info = fallbackExtract(
          enquiry.original_message,
          enquiry.channel,
          enquiry.name,
          enquiry.phone
        );

        // Detect duplicates by phone
        let isDuplicate = 0;
        let duplicateOf = null;
        if (enquiry.phone) {
          const existing = db.prepare(`
            SELECT e.id FROM enquiries e
            JOIN contacts c ON e.contact_id = c.id
            WHERE c.phone = ? AND e.id < ? AND e.ai_summary IS NOT NULL
            ORDER BY e.id ASC LIMIT 1
          `).get(enquiry.phone, enquiry.id) as { id: number } | undefined;
          if (existing) {
            isDuplicate = 1;
            duplicateOf = existing.id;
          }
        }

        db.prepare(`
          UPDATE enquiries SET
            interest = ?, category = ?, priority = ?, language = ?,
            ai_summary = ?, ai_classification_reason = ?,
            ai_recommended_actions = ?, is_spam = ?,
            is_duplicate = ?, duplicate_of = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `).run(
          info.interest, info.category, info.priority, info.language,
          info.summary, info.classification_reason,
          JSON.stringify(info.recommended_actions), info.is_spam ? 1 : 0,
          isDuplicate, duplicateOf,
          enquiry.id
        );

        results.push({ id: enquiry.id, status: 'processed', info });
      } catch (err) {
        results.push({ id: enquiry.id, status: 'error', error: String(err) });
      }

    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
