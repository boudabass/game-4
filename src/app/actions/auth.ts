import { cookies } from "next/headers";
import { odooClient } from "@/lib/odoo";

const SESSION_COOKIE_NAME = "arcade_session";
const USER_COOKIE_NAME = "arcade_user";

export async function setSessionCookie(sessionId: string, user?: any) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  if (user) {
    cookieStore.set(USER_COOKIE_NAME, JSON.stringify(user), {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value || null;
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
      await setSessionCookie(sessionId, user);
      return { success: true, user };
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
