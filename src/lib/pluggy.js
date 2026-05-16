const PLUGGY_API_URL = 'https://api.pluggy.ai'

async function getAccessToken() {
  const response = await fetch(`${PLUGGY_API_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  })
  const data = await response.json()
  return data.apiKey
}

export async function createConnectToken(itemId = null) {
  const apiKey = await getAccessToken()
  const body = itemId ? { itemId } : {}
  const response = await fetch(`${PLUGGY_API_URL}/connect_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  })
  const data = await response.json()
  return data.accessToken
}

export async function getItem(itemId) {
  const apiKey = await getAccessToken()
  const response = await fetch(`${PLUGGY_API_URL}/items/${itemId}`, {
    headers: { 'X-API-KEY': apiKey },
  })
  return response.json()
}

export async function getAccounts(itemId) {
  const apiKey = await getAccessToken()
  const response = await fetch(`${PLUGGY_API_URL}/accounts?itemId=${itemId}`, {
    headers: { 'X-API-KEY': apiKey },
  })
  return response.json()
}

export async function getTransactions(accountId, from, to) {
  const apiKey = await getAccessToken()
  const params = new URLSearchParams({ accountId })
  if (from) params.append('from', from)
  if (to) params.append('to', to)
  const response = await fetch(`${PLUGGY_API_URL}/transactions?${params}`, {
    headers: { 'X-API-KEY': apiKey },
  })
  return response.json()
}