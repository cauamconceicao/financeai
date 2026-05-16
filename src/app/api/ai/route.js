import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'
import { categorizeTransactions, generateInsights } from '@/lib/openai'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()
    const { action, transactions, transactionIds } = body

    if (transactions) {
      if (transactions.length === 0) {
        return NextResponse.json({
          insights: 'Conecte sua conta bancária para obter insights personalizados.',
        })
      }

      const insights = await generateInsights(transactions)
      return NextResponse.json({ insights })
    }

    if (action === 'categorize') {
      const { data: transactions } = await supabaseAdmin
        .from('financeai_transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .in('id', transactionIds || [])

      if (!transactions || transactions.length === 0) {
        return NextResponse.json({ error: 'Nenhuma transação encontrada' }, { status: 404 })
      }

      const categories = await categorizeTransactions(transactions)

      for (const cat of categories) {
        const tx = transactions[cat.index - 1]
        if (tx) {
          await supabaseAdmin
            .from('financeai_transactions')
            .update({ ai_category: cat.category })
            .eq('id', tx.id)
        }
      }

      return NextResponse.json({ success: true, categorized: categories.length })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('AI Error:', error.message, error.status)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
