import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const isPublicRoute = url.pathname === "/" || url.pathname === "/login" || url.pathname === "/register";

  // Usar Auth.js para verificar la sesión
  const session = await auth();

  // Si intenta acceder a una ruta protegida (cualquiera que no sea pública) sin sesión
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si está logueado e intenta ir a login/register, enviarlo al dashboard
  if ((url.pathname === "/login" || url.pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
