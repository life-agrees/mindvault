import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Shield, Zap } from 'lucide-react'

const DEV_AUTH = import.meta.env.VITE_DEV_AUTH === 'true' || import.meta.env.DEV

export default function Login() {
  const { login, saveAuth, authenticated, user, logout, token } = useAuth()
  const [devDid, setDevDid] = React.useState('did:privy:test123')
  const [devLoading, setDevLoading] = React.useState(false)

  async function doDevLogin() {
    setDevLoading(true)
    try {
      const res = await fetch(
        (import.meta.env.VITE_API_URL || 'http://localhost:3002') + '/auth/dev-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ privyDid: devDid }),
        }
      )
      const json = await res.json()
      if (json?.token) {
        await saveAuth(json.token, json.user)
      }
    } catch (e) {
      console.error('Dev login error', e)
    } finally {
      setDevLoading(false)
    }
  }

  // Logged-in user pill
  if (token && user) {
    const name = user.email || user.privy_did?.slice(0, 18) || 'Anonymous'
    const initials = (user.email || user.privy_did || 'U').slice(0, 2).toUpperCase()
    return (
      <div className="user-info">
        <div className="user-avatar">{initials}</div>
        <span className="user-name">{name}</span>
        <button className="btn btn-danger" onClick={logout} style={{ padding: '4px 10px', fontSize: 12 }}>
          Logout
        </button>
      </div>
    )
  }

  // Not yet logged in — show Privy login button + dev section
  return (
    <div className="login-screen">
      <div className="login-bg-glow" />
      <div className="login-card">
        <div className="login-icon">🧠</div>
        <h1>MindVault</h1>
        <p className="tagline">
          Your personal AI companion that truly remembers you.<br />
          Every memory is yours — encrypted, permanent, and on-chain.
        </p>

        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">🔐</span>
            <span>AES-256-GCM end-to-end encryption — keys never leave your wallet</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">⛓️</span>
            <span>Conversations stored permanently on <strong>0G Storage</strong></span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🤖</span>
            <span>AI inference on <strong>0G Compute</strong> — fully decentralized</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">✅</span>
            <span>Every memory has a cryptographic 0G hash proof</span>
          </div>
        </div>

        <button className="login-btn-privy" onClick={login}>
          <Shield size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
          Connect with Privy
        </button>

        {DEV_AUTH && (
          <div className="login-dev-section">
            <div className="login-dev-label">⚙️ Dev Mode</div>
            <input
              className="dev-input"
              value={devDid}
              onChange={e => setDevDid(e.target.value)}
              placeholder="did:privy:test..."
            />
            <button className="dev-login-btn" onClick={doDevLogin} disabled={devLoading}>
              {devLoading ? 'Connecting...' : 'Dev Login (no wallet signing)'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
