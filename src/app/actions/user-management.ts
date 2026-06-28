'use server'

import { getDb, LocalUser } from "@/lib/database"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function getUsersAction() {
  try {
    const db = await getDb();
    await db.read();
    return { success: true, users: db.data.users || [] };
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur lors de la récupération des utilisateurs" };
  }
}

export async function createUserAction(formData: FormData) {
  const email = formData.get('email') as string
  const name = (formData.get('name') as string) || ''
  const role = (formData.get('role') as 'admin' | 'user') || 'user'

  if (!email) {
    return { success: false, error: "L'email est requis" }
  }

  try {
    const db = await getDb();
    await db.read();

    const existing = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: "Un utilisateur avec cet email existe déjà" };
    }

    const newUser: LocalUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role,
      createdAt: new Date().toISOString()
    };

    await db.update(({ users }) => users.push(newUser));
    revalidatePath('/admin');
    return { success: true, message: "Utilisateur créé avec succès" };
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur de création" };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const db = await getDb();
    await db.read();

    await db.update(({ users }) => {
      const idx = users.findIndex(u => u.id === userId);
      if (idx >= 0) {
        users.splice(idx, 1);
      }
    });

    revalidatePath('/admin');
    return { success: true, message: "Utilisateur supprimé avec succès" };
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur de suppression" };
  }
}

export async function updateUserRoleAction(userId: string, role: string) {
  try {
    const db = await getDb();
    await db.read();

    await db.update(({ users }) => {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.role = role as 'admin' | 'user';
      }
    });

    revalidatePath('/admin');
    return { success: true, message: "Rôle mis à jour avec succès" };
  } catch (e: any) {
    return { success: false, error: e.message || "Erreur de mise à jour" };
  }
}
