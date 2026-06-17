import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { token, user, saveAuth, logout } = useAuth()
  const [did, setDid] = useState('did:privy:test123')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function doLogin() {
    setLoading(true)
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3002') + '/auth/dev-token', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ privyDid: did, email })
      })
      const json = await res.json()
      if (json?.token) {
        saveAuth(json.token, json.user)
      } else {
        alert('Login failed')
      }
    } catch (e) {
      alert('Login error')
    } finally { setLoading(false) }
  }

  if (token && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">{user.email ?? user.privy_did}</div>
        <button onClick={logout} className="text-sm text-red-600">Logout</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input className="border px-2 py-1 rounded" value={did} onChange={(e) => setDid(e.target.value)} />
      <input className="border px-2 py-1 rounded" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={doLogin} className="px-3 py-1 bg-green-600 text-white rounded" disabled={loading}>Login</button>
    </div>
  )
}
