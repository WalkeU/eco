import React, { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const apiBase = import.meta.env.VITE_API_BASE

  const [token, setToken] = useState(() => localStorage.getItem("accessToken"))
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user")
    return u ? JSON.parse(u) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem("accessToken", token)
    else localStorage.removeItem("accessToken")
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user))
    else localStorage.removeItem("user")
  }, [user])

  const login = async ({ username, password }) => {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || "Login failed")
    setToken(body.accessToken)
    setUser(body.user)
    return body
  }

  const register = async ({ username, email, password }) => {
    const res = await fetch(`${apiBase}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    })
    const body = await res.json()
    if (!res.ok) throw new Error(body.error || "Registration failed")
    return body
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  // helper fetch that includes Authorization header when available
  const authFetch = (input, init = {}) => {
    const headers = Object.assign({}, init.headers || {})
    if (token) headers["Authorization"] = `Bearer ${token}`
    return fetch(input, Object.assign({}, init, { headers }))
  }

  // validate token on startup / when token changes
  useEffect(() => {
    let mounted = true
    if (!token) return
    ;(async () => {
      try {
        const res = await authFetch(`${apiBase}/auth/me`)
        if (!res.ok) {
          if (res.status === 401) {
            // token invalid or expired
            logout()
          }
          return
        }
        const data = await res.json()
        if (mounted) setUser(data)
      } catch (err) {
        console.error("auth validation failed", err)
        logout()
      }
    })()

    return () => {
      mounted = false
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, authFetch, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

export default AuthContext
