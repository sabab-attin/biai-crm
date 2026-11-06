import { NextRequest, NextResponse } from 'next/server';
import { generateReply } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      customerName,
      interest,
      category,
      priority,
      sentiment,
      summary,
      recommendedActions,
      language,
      tone,
    } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    const reply = await generateReply(
      message,
      customerName || 'Customer',
      interest || 'General',
      language || 'English',
      tone || 'friendly',
      { category, priority, sentiment, summary, recommendedActions }
    );
    return NextResponse.json({ reply });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
