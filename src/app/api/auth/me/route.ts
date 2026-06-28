import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('arcade_session')?.value;
  const userCookie = cookieStore.get('arcade_user')?.value;

  if (!sessionCookie || !userCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const userData = JSON.parse(userCookie);
    // Map Odoo user structure to our LocalUser structure expected by frontend
    const user = {
      id: userData.uid.toString(),
      email: userData.username || '',
      name: userData.name || '',
      role: userData.is_admin ? 'admin' : 'user'
    };
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ user: null });
  }
}
