"use server";

import { cookies } from "next/headers";
import { odooClient } from "@/lib/odoo";

const SESSION_COOKIE_NAME = "arcade_session";
const USER_COOKIE_NAME = "arcade_user";

// Domaine de cookie optionnel. À définir (ex. ".theelsassisch.com") le jour où
// l'app est servie sur un SOUS-DOMAINE du site : la session devient alors
// "same-site" et cesse d'être un cookie tiers bloqué dans l'iframe.
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// Options communes aux cookies de session.
// - sameSite "none" + secure : requis pour un contexte d'iframe cross-site.
// - partitioned (CHIPS) : autorise le cookie dans une iframe tierce sur
//   Chrome/Edge/Firefox (partitionné par site parent) au lieu d'être bloqué.
//   NB: Safari n'honore pas CHIPS -> la solution durable reste le sous-domaine.
function baseCookieOptions() {
  const opts: Record<string, unknown> = {
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    partitioned: true,
  };
  if (COOKIE_DOMAIN) opts.domain = COOKIE_DOMAIN;
  return opts;
}

export async function setSessionCookie(sessionId: string, user?: any) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, { ...baseCookieOptions(), httpOnly: true } as any);

  if (user) {
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), { ...baseCookieOptions(), httpOnly: false } as any);
  }
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
}

// Renvoie l'utilisateur client (uid, nom, ...) depuis le cookie arcade_user.
export async function getSessionUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email et mot de passe requis" };
  }

  try {
    const { user, sessionId } = await odooClient.authenticate(email, password);

    if (sessionId) {
      // IMPORTANT : ne stocker qu'un cookie MINIMAL (l'objet session Odoo complet
      // est trop volumineux -> cookie tronqué/rejeté, surtout en iframe).
      const slimUser = {
        uid: user?.uid,
        name: user?.name,
        username: user?.username,
      };
      await setSessionCookie(sessionId, slimUser);
      return { success: true, user: slimUser };
    } else {
      return { success: false, error: "Identifiants incorrects ou échec de l'authentification" };
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    return { success: false, error: error.message || "Erreur lors de l'authentification" };
  }
}

export async function signOutAction() {
  await clearSessionCookie();
}
