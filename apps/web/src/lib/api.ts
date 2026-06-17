const API = import.meta.env.VITE_API_URL || 'http://localhost:3002'

function getToken() {
  try { return localStorage.getItem('mv_token') }
  catch { return null }
}

async function call(path: string, opts: any = {}) {
  const url = API + path
  const headers: any = opts.headers ?? {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const body = opts.body ? JSON.stringify(opts.body) : undefined

  const res = await fetch(url, { method: opts.method ?? 'GET', headers: { 'Content-Type': 'application/json', ...headers }, body })
  return res.json().catch(() => null)
}

export function sendMessageApi(message: string, sessionMessages: any[] = []) {
  return call('/chat/message', { method: 'POST', body: { message, sessionMessages } })
}

export function saveSessionApi(messages: any[]) {
  return call('/chat/save', { method: 'POST', body: { messages } })
}

export function listMemoriesApi() {
  return call('/chat/memories')
}

export function getMemoryApi(hash: string) {
  return call(`/chat/memory/${encodeURIComponent(hash)}`)
}

export default { sendMessageApi, saveSessionApi, listMemoriesApi, getMemoryApi }
