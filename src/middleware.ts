import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('arcade_session')?.value;
  let user = null;

  if (sessionCookie) {
    try {
      user = JSON.parse(sessionCookie);
    } catch (e) {
      // Ignorer l'erreur de parsing JSON
    }
  }

  const { pathname } = request.nextUrl;

  // Routes nécessitant une connexion
  const protectedRoutes = ['/admin', '/dashboard', '/games', '/play'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Restriction d'accès à la console d'administration
  if (pathname.startsWith('/admin') && user && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si l'utilisateur est déjà connecté et va sur / ou /login, redirection vers le dashboard
  if ((pathname === '/login' || pathname === '/') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tous les chemins sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - public (fichiers publics)
     * - assets (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}