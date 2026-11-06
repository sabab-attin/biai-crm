import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST(request: NextRequest) {
  try {
    let force = false;
    try {
      const body = await request.json();
      force = Boolean(body?.force);
    } catch {
      // Body not provided or not JSON
    }
    const { searchParams } = new URL(request.url);
    if (searchParams.get('force') === 'true') {
      force = true;
    }

    const result = await seedDatabase(force);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await seedDatabase(false);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
