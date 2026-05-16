'use client'
import { useState } from 'react'

const CATEGORIES = [
  'Todas',
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Salário',
  'Investimento',
  'Compras',
  'Serviços',
  'Outros',
]

export default function TransactionList({ transactions }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase())
    const matchCategory =
      category === 'Todas' || t.ai_category === category || t.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Buscar transação..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Nenhuma transação encontrada.</p>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {filtered.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </span>
                  {(tx.ai_category || tx.category) && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                      {tx.ai_category || tx.category}
                    </span>
                  )}
                  {tx.account && (
                    <span className="text-xs text-gray-400">{tx.account}</span>
                  )}
                </div>
              </div>
              <span
                className={`text-sm font-semibold ml-4 shrink-0 ${
                  tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
