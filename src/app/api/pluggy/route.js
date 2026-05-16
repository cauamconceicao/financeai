import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createConnectToken, getAccounts, getTransactions } from '@/lib/pluggy'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'connect_token') {
    const token = await createConnectToken()
    return NextResponse.json({ token })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { itemId, connectorName } = await request.json()
  const userId = session.user.id

  try {
    // Salva a conexão
    const { data: connection } = await supabaseAdmin
      .from('financeai_connections')
      .insert([{ user_id: userId, item_id: itemId, connector_name: connectorName }])
      .select()
      .single()

    // Busca contas
    const accountsData = await getAccounts(itemId)
    const accounts = accountsData.results || []

    // Busca transações de cada conta
    const allTransactions = []
    for (const account of accounts) {
      const txData = await getTransactions(account.id)
      const txs = txData.results || []
      txs.forEach((tx) => {
        allTransactions.push({
          user_id: userId,
          connection_id: connection.id,
          external_id: tx.id,
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          category: tx.category,
          account: account.name,
        })
      })
    }

    // Salva transações
    if (allTransactions.length > 0) {
      await supabaseAdmin
        .from('financeai_transactions')
        .upsert(allTransactions, { onConflict: 'external_id' })
    }

    return NextResponse.json({ success: true, transactions: allTransactions.length })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}