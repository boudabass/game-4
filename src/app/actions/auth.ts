'use server'

import { cookies } from 'next/headers'
import { getDb } from '@/lib/database'

export async function signInAction(userId: string) {
  const cookieStore = await cookies();
  const db = await getDb();
  await db.read();
  
  const user = db.data.users.find(u => u.id === userId);
  if (!user) {
    return { success: false, error: "Utilisateur non trouvé" };
  }

  cookieStore.set({
    name: 'arcade_session',
    value: JSON.stringify(user),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 semaine
  });

  return { success: true };
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('arcade_session');
}
