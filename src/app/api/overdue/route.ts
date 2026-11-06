import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const overdue = db.prepare(`
      SELECT e.*, c.name, c.phone, c.email,
        ROUND((julianday('now') - julianday(e.received_at)) * 24, 1) as hours_since_received
      FROM enquiries e
      LEFT JOIN contacts c ON e.contact_id = c.id
      WHERE e.status = 'New'
      AND e.is_spam = 0
      AND e.last_follow_up IS NULL
      ORDER BY e.received_at ASC
    `).all();

    return NextResponse.json(overdue);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
