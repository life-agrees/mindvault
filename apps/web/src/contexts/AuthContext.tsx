import React, { createContext, useContext, useState, useEffect } from 'react'

type User = { id: string; privy_did?: string; email?: string }

const TOKEN_KEY = 'mv_token'
const USER_KEY = 'mv_user'

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    const u = localStorage.getItem(USER_KEY)
    if (t) setToken(t)
    if (u) setUser(JSON.parse(u))
  }, [])

  function saveAuth(t: string, u: User) {
    setToken(t)
    setUser(u)
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider value={{ token, user, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
