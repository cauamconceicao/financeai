import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function categorizeTransactions(transactions) {
  const descriptions = transactions
    .map((t, i) => `${i + 1}. ${t.description} (R$ ${Math.abs(t.amount)})`)
    .join('\n')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Você é um assistente financeiro. Categorize cada transação em uma dessas categorias:
Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Salário, Investimento, Compras, Serviços, Outros.
Responda APENAS com um JSON array com os números e categorias, exemplo:
[{"index": 1, "category": "Alimentação"}, {"index": 2, "category": "Transporte"}]

Categorize essas transações:
${descriptions}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return Array.isArray(parsed) ? parsed : parsed.categories || []
  } catch {
    return []
  }
}

export async function generateInsights(transactions) {
  const summary = transactions.reduce((acc, t) => {
    const cat = t.ai_category || t.category || 'Outros'
    if (!acc[cat]) acc[cat] = 0
    acc[cat] += Math.abs(t.amount)
    return acc
  }, {})

  const summaryText = Object.entries(summary)
    .map(([cat, value]) => `${cat}: R$ ${value.toFixed(2)}`)
    .join('\n')

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Você é um consultor financeiro pessoal. Analise os gastos e dê 3 insights curtos e práticos em português. Seja direto e útil.

Meus gastos do mês:
${summaryText}

Dê 3 insights financeiros.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
