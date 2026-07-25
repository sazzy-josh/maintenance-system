import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api, setAccessToken } from '../lib/axios'
import { User } from '../types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.data)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await api.post('/auth/refresh')
        setAccessToken(data.data.accessToken)
        await refreshUser()
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAccessToken(data.data.accessToken)
    setUser(data.data.user)
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch {}
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
