'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

const CHAT_API = 'https://finance-chat-api.onrender.com/chat'

const INITIAL_MESSAGE = {
  role: 'assistant',
  text: 'Olá! Sou seu assistente financeiro inteligente. Posso analisar suas transações, ajudar com orçamento e responder dúvidas sobre suas finanças. Como posso ajudar?',
}

export default function FinancialChat() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [financialData, setFinancialData] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const fetchFinancialData = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions')
      if (!res.ok) return
      const data = await res.json()
      const txs = data.transactions || []

      const income = txs.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      const expenses = txs
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const byCategory = txs.reduce((acc, t) => {
        const cat = t.ai_category || t.category || 'Outros'
        acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
        return acc
      }, {})

      setFinancialData({
        transactions: txs.slice(0, 50).map((t) => ({
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.ai_category || t.category,
          account: t.account,
        })),
        summary: {
          balance: income - expenses,
          income,
          expenses,
          total_transactions: txs.length,
          by_category: byCategory,
        },
      })
    } catch {
      // continue without financial context
    }
  }, [])

  useEffect(() => {
    if (isOpen && !financialData && session) {
      fetchFinancialData()
    }
  }, [isOpen, session, financialData, fetchFinancialData])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          transactions: financialData?.transactions || [],
          balance: financialData?.balance || 0,
          currency: 'BRL',
        }),
      })

      const data = await res.json()
      const reply =
        data.response || data.message || data.reply || data.text || data.answer ||
        'Desculpe, não consegui processar sua mensagem.'

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Erro ao conectar com o assistente. Tente novamente.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!session) return null

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Abrir chat financeiro"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 flex items-center justify-center transition-all"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Assistente Financeiro</p>
                <p className="text-indigo-200 text-xs">
                  {financialData ? `${financialData.summary.total_transactions} transações carregadas` : 'Carregando dados...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors p-1"
              aria-label="Fechar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-gray-200 p-3 bg-white flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 disabled:opacity-50 bg-white"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="Enviar mensagem"
              className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
