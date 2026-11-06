import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const enquiry = db.prepare(`
      SELECT e.*, c.name, c.phone, c.email
      FROM enquiries e
      LEFT JOIN contacts c ON e.contact_id = c.id
      WHERE e.id = ?
    `).get(id);

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    // Get related enquiries (same contact)
    const enq = enquiry as Record<string, unknown>;
    const related = db.prepare(`
      SELECT e.id, e.original_message, e.received_at, e.channel, e.status, e.interest
      FROM enquiries e
      WHERE e.contact_id = ? AND e.id != ?
      ORDER BY e.received_at DESC
    `).all(enq.contact_id, id);

    // Get replies
    const replies = db.prepare('SELECT * FROM replies WHERE enquiry_id = ? ORDER BY created_at DESC').all(id);

    // Get AI feedback
    const feedback = db.prepare('SELECT * FROM ai_feedback WHERE enquiry_id = ?').all(id);

    // Get activity log
    const activity = db.prepare('SELECT * FROM activity_log WHERE enquiry_id = ? ORDER BY created_at DESC').all(id);

    return NextResponse.json({ ...enq, related_enquiries: related, replies, feedback, activity });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();

    const allowedFields = [
      'status', 'interest', 'category', 'priority', 'assigned_to',
      'follow_up_date', 'last_follow_up', 'is_spam',
      'human_corrected_interest', 'human_corrected_category',
      'ai_summary', 'ai_classification_reason', 'ai_recommended_actions',
      'ai_confidence', 'language'
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE enquiries SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    // Store AI feedback if human corrected
    if (body.human_corrected_interest || body.human_corrected_category) {
      const enquiry = db.prepare('SELECT interest, category FROM enquiries WHERE id = ?').get(id) as Record<string, string>;
      if (body.human_corrected_interest) {
        db.prepare('INSERT INTO ai_feedback (enquiry_id, field_name, ai_value, corrected_value) VALUES (?, ?, ?, ?)').run(
          id, 'interest', enquiry.interest, body.human_corrected_interest
        );
      }
      if (body.human_corrected_category) {
        db.prepare('INSERT INTO ai_feedback (enquiry_id, field_name, ai_value, corrected_value) VALUES (?, ?, ?, ?)').run(
          id, 'category', enquiry.category, body.human_corrected_category
        );
      }
    }

    // Store reply if dispatched/recorded
    if (body.new_reply) {
      db.prepare('INSERT INTO replies (enquiry_id, reply_text, language, tone) VALUES (?, ?, ?, ?)').run(
        id, body.new_reply.text, body.new_reply.language || 'English', body.new_reply.tone || 'friendly'
      );
      db.prepare('INSERT INTO activity_log (enquiry_id, action, details) VALUES (?, ?, ?)').run(
        id, 'reply_recorded', `Reply recorded (${body.new_reply.language || 'English'}, ${body.new_reply.tone || 'friendly'})`
      );
    }

    // Log activity
    db.prepare('INSERT INTO activity_log (enquiry_id, action, details) VALUES (?, ?, ?)').run(
      id, 'updated', `Fields updated: ${Object.keys(body).filter(k => k !== 'new_reply').join(', ')}`
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
