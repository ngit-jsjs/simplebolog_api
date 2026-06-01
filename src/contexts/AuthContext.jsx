import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('accessToken')))

  const fetchMe = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch {
      localStorage.removeItem('accessToken')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
      setUser(null)
    }
  }, [token])

  const login = async (accessToken) => {
    localStorage.setItem('accessToken', accessToken)
    setToken(accessToken)
    setLoading(true)
    await fetchMe()
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Lỗi khi gọi API logout:', error)
    } finally {
      localStorage.removeItem('accessToken')
      setToken(null)
      setUser(null)
    }
  }

  const value = useMemo(
    () => ({ token, user, loading, isAuthenticated: Boolean(token), login, logout, refreshMe: fetchMe }),
    [token, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth phải được dùng trong AuthProvider')
  return context
}
