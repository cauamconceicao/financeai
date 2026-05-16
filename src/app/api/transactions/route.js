import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const search = searchParams.get('search')

  let query = supabaseAdmin
    .from('financeai_transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })

  if (category) query = query.eq('ai_category', category)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)
  if (search) query = query.ilike('description', `%${search}%`)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ transactions: data })
}
