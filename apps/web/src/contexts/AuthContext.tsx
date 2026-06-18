import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { deriveKeyFromSignature } from '../lib/crypto'

type User = { id: string; privy_did?: string; email?: string }

const TOKEN_KEY = 'mv_token'
const USER_KEY = 'mv_user'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {
  const { login: privyLogin, logout: privyLogout, user: privyUser, ready, authenticated, getAccessToken } = usePrivy()
  const { wallets } = useWallets()

  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null)
  const [keyDeriving, setKeyDeriving] = useState(false)

  // 1. Initial Load from LocalStorage and SessionStorage
  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    const u = localStorage.getItem(USER_KEY)
    const k = sessionStorage.getItem('mv_encryption_key')
    
    if (t) setToken(t)
    if (u) setUser(JSON.parse(u))
    if (k) setEncryptionKey(k)
  }, [])

  // 2. Automatically sync Privy state to Backend session token
  useEffect(() => {
    if (!ready) return

    if (authenticated && privyUser) {
      const localToken = localStorage.getItem(TOKEN_KEY)
      const localUserStr = localStorage.getItem(USER_KEY)
      
      if (localToken && localUserStr) {
        const localUser = JSON.parse(localUserStr)
        if (localUser.privy_did === privyUser.id) {
          setToken(localToken)
          setUser(localUser)
          return
        }
      }

      // Backend login with Privy Token
      getAccessToken().then(async (accessToken) => {
        if (!accessToken) return
        try {
          const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:3002') + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              privyToken: accessToken,
              email: privyUser.email?.address || privyUser.google?.email || null
            })
          })
          const json = await res.json()
          if (json?.token) {
            setToken(json.token)
            setUser(json.user)
            localStorage.setItem(TOKEN_KEY, json.token)
            localStorage.setItem(USER_KEY, JSON.stringify(json.user))
          }
        } catch (e) {
          console.error('Privy backend login failed:', e)
        }
      })
    } else {
      // Clear local storage if logged out (excluding mock dev users)
      const localUserStr = localStorage.getItem(USER_KEY)
      if (localUserStr) {
        const localUser = JSON.parse(localUserStr)
        if (localUser.privy_did && !localUser.privy_did.startsWith('did:privy:test') && !localUser.privy_did.startsWith('did:privy:enc')) {
          logout()
        }
      }
    }
  }, [authenticated, privyUser, ready])

  // 3. Derive symmetric key from active wallet signature
  useEffect(() => {
    const cachedKey = sessionStorage.getItem('mv_encryption_key')
    if (cachedKey) {
      setEncryptionKey(cachedKey)
      return
    }

    if (authenticated && wallets.length > 0 && !keyDeriving) {
      const deriveKey = async () => {
        setKeyDeriving(true)
        try {
          const wallet = wallets[0]
          const provider = await wallet.getEthereumProvider()
          const hexMsg = "0x" + Array.from(new TextEncoder().encode("Unlock your MindVault memories securely.")).map(b => b.toString(16).padStart(2, '0')).join('')
          
          const signature = await provider.request({
            method: 'personal_sign',
            params: [hexMsg, wallet.address]
          })
          
          const key = await deriveKeyFromSignature(signature)
          sessionStorage.setItem('mv_encryption_key', key)
          setEncryptionKey(key)
        } catch (err) {
          console.error('Wallet key derivation failed:', err)
        } finally {
          setKeyDeriving(false)
        }
      }
      deriveKey()
    }
  }, [authenticated, wallets, keyDeriving])

  // For Dev login fallback
  async function saveAuth(t: string, u: User) {
    setToken(t)
    setUser(u)
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    
    if (u.privy_did) {
      const key = await deriveKeyFromSignature(u.privy_did)
      sessionStorage.setItem('mv_encryption_key', key)
      setEncryptionKey(key)
    }
  }

  function logout() {
    setToken(null)
    setUser(null)
    setEncryptionKey(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem('mv_encryption_key')
    if (authenticated) {
      privyLogout()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        encryptionKey,
        saveAuth,
        logout,
        login: privyLogin,
        authenticated,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
