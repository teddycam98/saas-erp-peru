import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.usuario.findFirst({
          where: { email: credentials.email as string },
          include: { empresa: true }
        });

        if (!user || !user.estado) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.nombre,
            empresaId: user.empresaId,
            subdominio: user.empresa.subdominio,
            rol: user.rol
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.empresaId = (user as any).empresaId;
        token.subdominio = (user as any).subdominio;
        token.rol = (user as any).rol;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).empresaId = token.empresaId;
        (session.user as any).subdominio = token.subdominio;
        (session.user as any).rol = token.rol;
      }
      return session;
    }
  },
  session: { strategy: "jwt" }
});
