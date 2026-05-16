'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function ConnectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [scriptReady, setScriptReady] = useState(false)
  const [connectToken, setConnectToken] = useState(null)
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/pluggy?action=connect_token')
      .then((res) => res.json())
      .then(({ token }) => setConnectToken(token))
      .catch(() => setTokenError('Não foi possível carregar o token de conexão.'))
  }, [status])

  const handleConnect = useCallback(async () => {
    if (!scriptReady || !connectToken) return
    setLoading(true)
    setMessage('')

    try {
      const pluggyConnect = new window.PluggyConnect({
        connectToken,
        sandbox: true,
        onSuccess: async ({ item }) => {
          const response = await fetch('/api/pluggy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              itemId: item.id,
              connectorName: item.connector?.name,
            }),
          })
          const data = await response.json()
          if (data.success) {
            setMessage(`Conta conectada! ${data.transactions} transações importadas.`)
            setTimeout(() => router.push('/dashboard'), 2000)
          } else {
            setMessage('Erro ao salvar as transações.')
          }
          setLoading(false)
        },
        onError: (error) => {
          setMessage(`Erro: ${error.message}`)
          setLoading(false)
        },
        onClose: () => setLoading(false),
      })

      pluggyConnect.init()
    } catch (err) {
      setMessage(`Erro: ${err.message}`)
      setLoading(false)
    }
  }, [scriptReady, connectToken, router])

  if (status === 'loading') {
    return <div className="p-8 text-center text-gray-500">Carregando...</div>
  }

  const features = [
    ['Conexão segura via Pluggy', 'Suas credenciais nunca são armazenadas em nossos servidores'],
    ['Importação automática', 'Sincronize seu histórico financeiro em segundos'],
    ['Análise com IA', 'Receba insights personalizados sobre seus gastos'],
  ]

  return (
    <>
      <Script
        src="https://cdn.pluggy.ai/pluggy-connect/v2.5.0/pluggy-connect.js"
        strategy="lazyOnload"
        onReady={() => setScriptReady(true)}
      />
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Conectar Conta Bancária</h1>
        <p className="text-gray-500 mb-8">
          Conecte sua conta de forma segura via Pluggy para importar transações e receber análises
          com IA.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {features.map(([title, desc]) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm shrink-0">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {(message || tokenError) && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.startsWith('Erro') || tokenError
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {tokenError || message}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading || !scriptReady || !connectToken}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Conectando...' : !connectToken ? 'Carregando...' : 'Conectar conta bancária'}
        </button>
      </div>
    </>
  )
}
