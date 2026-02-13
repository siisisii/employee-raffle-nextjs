import { NextResponse } from 'next/server';
import { resetWinners } from '@/lib/db';

export async function POST() {
  try {
    resetWinners();
    return NextResponse.json({ success: true, message: 'Raffle reset successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
