import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();

    // Find contacts with multiple enquiries (by phone)
    const duplicates = db.prepare(`
      SELECT c.id as contact_id, c.name, c.phone, COUNT(e.id) as enquiry_count,
        GROUP_CONCAT(e.id) as enquiry_ids
      FROM contacts c
      JOIN enquiries e ON e.contact_id = c.id
      WHERE c.phone IS NOT NULL AND c.phone != ''
      GROUP BY c.phone
      HAVING COUNT(e.id) > 1
    `).all() as Array<{
      contact_id: number;
      name: string;
      phone: string;
      enquiry_count: number;
      enquiry_ids: string;
    }>;

    // Get full enquiry details for each duplicate group
    const result = duplicates.map(dup => {
      const ids = dup.enquiry_ids.split(',').map(Number);
      const enquiries = db.prepare(`
        SELECT e.id, e.original_message, e.received_at, e.channel, e.status, e.interest, e.category
        FROM enquiries e WHERE e.id IN (${ids.map(() => '?').join(',')})
        ORDER BY e.received_at ASC
      `).all(...ids);
      return { ...dup, enquiries };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
