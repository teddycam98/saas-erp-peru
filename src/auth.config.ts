import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = !nextUrl.pathname.startsWith('/login') && !nextUrl.pathname.startsWith('/api');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isLoggedIn) {
        // Redirigimos al dashboard del dominio del usuario si ya está logueado
        // En un SaaS real, se extraerá el tenant desde el auth.user.tenantId
        return true; 
      }
      return true;
    },
  },
  providers: [], // Agregados en auth.ts
} satisfies NextAuthConfig;
