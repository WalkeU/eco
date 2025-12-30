import React, { createContext, useContext, useEffect, useState } from "react"
import * as userApi from "../api/user"

const UserContext = createContext(null)

export function UserProvider({ children }) {
  // undefined: töltődik, null: nincs user, {…}: be van jelentkezve
  const [user, setUser] = useState(undefined)

  const login = async ({ username, password }) => {
    await userApi.login({ username, password })
    await fetchUser()
  }

  const register = async ({ username, email, password }) => {
    await userApi.register({ username, email, password })
    await fetchUser()
  }

  const logout = async () => {
    // Ha van logout endpoint, hívd meg itt
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
    fetchUser()
  }, [])

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
