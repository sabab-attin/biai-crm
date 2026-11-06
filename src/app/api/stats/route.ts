import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    const total = (db.prepare('SELECT COUNT(*) as count FROM enquiries').get() as { count: number }).count;

    const byStatus = db.prepare(`
      SELECT status, COUNT(*) as count FROM enquiries GROUP BY status
    `).all() as Array<{ status: string; count: number }>;

    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count FROM enquiries WHERE category != '' GROUP BY category
    `).all() as Array<{ category: string; count: number }>;

    const byChannel = db.prepare(`
      SELECT channel, COUNT(*) as count FROM enquiries GROUP BY channel
    `).all() as Array<{ channel: string; count: number }>;

    const byInterest = db.prepare(`
      SELECT interest, COUNT(*) as count FROM enquiries WHERE interest != '' AND interest != 'General' GROUP BY interest
    `).all() as Array<{ interest: string; count: number }>;

    const byPriority = db.prepare(`
      SELECT priority, COUNT(*) as count FROM enquiries GROUP BY priority
    `).all() as Array<{ priority: string; count: number }>;

    const corporateLeads = (db.prepare(
      "SELECT COUNT(*) as count FROM enquiries WHERE category = 'Corporate Lead'"
    ).get() as { count: number }).count;

    const spamCount = (db.prepare(
      'SELECT COUNT(*) as count FROM enquiries WHERE is_spam = 1'
    ).get() as { count: number }).count;

    const duplicateCount = (db.prepare(
      'SELECT COUNT(*) as count FROM enquiries WHERE is_duplicate = 1'
    ).get() as { count: number }).count;

    const urgentCount = (db.prepare(
      "SELECT COUNT(*) as count FROM enquiries WHERE priority = 'Urgent'"
    ).get() as { count: number }).count;

    // Overdue follow-ups (no follow-up within 48 hours)
    const overdueCount = (db.prepare(`
      SELECT COUNT(*) as count FROM enquiries
      WHERE status = 'New'
      AND last_follow_up IS NULL
      AND datetime(received_at) < datetime('now', '-2 days')
    `).get() as { count: number }).count;

    const recentActivity = db.prepare(`
      SELECT al.*, c.name FROM activity_log al
      LEFT JOIN contacts c ON al.contact_id = c.id
      ORDER BY al.created_at DESC LIMIT 10
    `).all();

    return NextResponse.json({
      total,
      byStatus,
      byCategory,
      byChannel,
      byInterest,
      byPriority,
      corporateLeads,
      spamCount,
      duplicateCount,
      urgentCount,
      overdueCount,
      recentActivity,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
