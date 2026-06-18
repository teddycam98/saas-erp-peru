import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default auth((req) => {
  const url = req.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const isPublicRoute = url.pathname === "/" || url.pathname === "/login" || url.pathname === "/register";

  // Usar Auth.js para verificar la sesión
  const isLoggedIn = !!req.auth;

  // Si intenta acceder a una ruta protegida sin sesión
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si está logueado e intenta ir a login/register, enviarlo al dashboard
  if ((url.pathname === "/login" || url.pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});
