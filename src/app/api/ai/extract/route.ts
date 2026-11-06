import { NextRequest, NextResponse } from 'next/server';
import { extractEnquiryInfo } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { message, channel, senderName, phone } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    const result = await extractEnquiryInfo(message, channel, senderName, phone);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
