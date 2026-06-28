import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('arcade_session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(sessionCookie);
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ user: null });
  }
}
