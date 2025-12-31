import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import * as userApi from "../api/user"
import { setGlobalLogoutHandler } from "../api/apiFetch"

const UserContext = createContext(null)

export function UserProvider({ children }) {
  // undefined: töltődik, null: nincs user, {…}: be van jelentkezve
  const [user, setUser] = useState(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const login = async ({ username, password }) => {
    await userApi.login({ username, password })
    await fetchUser()
  }

  const register = async ({ username, email, password }) => {
    await userApi.register({ username, email, password })
    await fetchUser()
  }

  const logout = async () => {
    try {
      await userApi.logout()
    } catch {}
    setUser(null)
  }

  const fetchUser = useCallback(async () => {
    if (isLoading) return // Ne indítsunk több párhuzamos fetchet

    setIsLoading(true)
    try {
      const res = await userApi.getMe()
      setUser(res.data)
    } catch (err) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  useEffect(() => {
    // Beállítjuk a globális logout handlert
    setGlobalLogoutHandler(() => {
      setUser(null)
    })
  }, [])

  return (
    <UserContext.Provider
      value={{ user, isLoading, login, register, logout, fetchUser, isAuthenticated: !!user }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}

export default UserContext
