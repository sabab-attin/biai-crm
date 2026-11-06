import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateInsights } from '@/lib/ai';

export async function POST() {
  try {
    const db = getDb();
    const enquiries = db.prepare(`
      SELECT e.id, c.name, e.interest, e.category, e.status, e.priority, e.channel
      FROM enquiries e
      LEFT JOIN contacts c ON e.contact_id = c.id
      ORDER BY e.received_at DESC
    `).all() as Array<{
      id: number; name: string; interest: string; category: string;
      status: string; priority: string; channel: string;
    }>;

    const insights = await generateInsights(enquiries);
    return NextResponse.json({ insights });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
