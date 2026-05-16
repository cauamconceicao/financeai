import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { email, name, image } = user
      const { data } = await supabaseAdmin
        .from('financeai_users')
        .select('id')
        .eq('email', email)
        .single()

      if (!data) {
        await supabaseAdmin.from('financeai_users').insert([{ email, name, image }])
      }
      return true
    },
    async session({ session }) {
      const { data } = await supabaseAdmin
        .from('financeai_users')
        .select('id')
        .eq('email', session.user.email)
        .single()

      if (data) session.user.id = data.id
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }