import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    const enquiries = db.prepare(`
      SELECT * FROM enquiries WHERE contact_id = ? ORDER BY received_at DESC
    `).all(id);

    const activity = db.prepare(`
      SELECT * FROM activity_log WHERE contact_id = ? ORDER BY created_at DESC
    `).all(id);

    return NextResponse.json({ contact, enquiries, activity });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
