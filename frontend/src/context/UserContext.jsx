import React, { createContext, useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import * as userApi from "../api/user"
import { setGlobalLogoutHandler } from "../api/apiFetch"

const UserContext = createContext(null)

export function UserProvider({ children }) {
  // undefined: töltődik, null: nincs user, {…}: be van jelentkezve
  const [user, setUser] = useState(undefined)
  const location = useLocation()
  useEffect(() => {}, [user])

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

  const fetchUser = async () => {
    // loading screen szebb legyen produkcioban legyen kis delay mindig
    // await new Promise((r) => setTimeout(r, 1500))
    try {
      const res = await userApi.getMe()
      setUser(res.data)
    } catch (err) {
      setUser(null)
    }
  }

  useEffect(() => {
    // Beállítjuk a globális logout handlert
    setGlobalLogoutHandler(() => {
      setUser(null)
    })
    fetchUser()
  }, [])

  // Új: minden route váltásnál frissítjük a user-t
  useEffect(() => {
    fetchUser()
  }, [location])

  return (
    <UserContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
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
