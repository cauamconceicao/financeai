'use client'
import { useState } from 'react'

export default function DashboardCards({ transactions }) {
  const [insights, setInsights] = useState('')
  const [loading, setLoading] = useState(false)

  const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const balance = income - expenses

  async function fetchInsights() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      })
      const data = await res.json()
      setInsights(data.insights || '')
    } catch {
      setInsights('Erro ao carregar insights.')
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { label: 'Receitas', value: income, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Despesas', value: expenses, color: 'text-red-600', bg: 'bg-red-50' },
    {
      label: 'Saldo',
      value: balance,
      color: balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`${card.bg} rounded-xl p-5`}>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className={`text-2xl font-bold mt-1 ${card.color}`}>
              {card.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-indigo-700">Insights da IA</h3>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Analisando...' : insights ? 'Atualizar' : 'Gerar insights'}
          </button>
        </div>
        {insights ? (
          <p className="text-sm text-gray-700 whitespace-pre-line">{insights}</p>
        ) : (
          <p className="text-sm text-gray-400">
            Clique em &quot;Gerar insights&quot; para analisar seus gastos com IA.
          </p>
        )}
      </div>
    </div>
  )
}
