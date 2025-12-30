import { apiFetch } from "../api/apiFetch"
const ApiFetch = (input, init = {}) => {
  return apiFetch(input, token, init)
}
import React, { createContext, useContext, useEffect, useState } from "react"
import * as userApi from "../api/user"

const UserContext = createContext(null)

export function UserProvider({ children }) {
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
    const body = await userApi.login({ username, password })
    setToken(body.accessToken)
    setUser(body.user)
    return body
  }

  const register = async ({ username, email, password }) => {
    return userApi.register({ username, email, password })
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const fetchUser = async () => {
    try {
      const res = await userApi.getMe(token)
      setUser(res.data)
    } catch (err) {
      setUser(null)
    }
  }

  useEffect(() => {
    if (token) fetchUser()
  }, [token])

  return (
    <UserContext.Provider
      value={{ user, token, login, register, logout, isAuthenticated: !!token, ApiFetch }}
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
