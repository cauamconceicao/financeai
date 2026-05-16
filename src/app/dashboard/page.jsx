import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import DashboardCards from '@/components/DashboardCards'
import TransactionList from '@/components/TransactionList'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  const { data: transactions } = await supabaseAdmin
    .from('financeai_transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(200)

  const txs = transactions || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/connect"
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Conectar Banco
        </Link>
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">Nenhuma transação encontrada.</p>
          <Link
            href="/connect"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Conectar conta bancária
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <DashboardCards transactions={txs} />
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Transações</h2>
            <TransactionList transactions={txs} />
          </div>
        </div>
      )}
    </div>
  )
}
