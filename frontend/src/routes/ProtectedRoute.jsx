import React, { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"
import LoadingScreen from "../components/loaders/LoadingScreen"
import * as userApi from "../api/user"

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  useEffect(() => {
    // Token ellenőrzés - ha lejárt, 401-et kap és az interceptor kirúgja
    if (user) {
      userApi.getMe().catch(() => {
        // Ha hiba van, nem csinálunk semmit, az interceptor már kezeli
      })
    }
  }, [user])

  if (user === undefined) {
    // Loading state
    return <LoadingScreen />
  }

  if (user === null) {
    // Not authenticated, redirect
    return <Navigate to="/auth" replace />
  }

  // Authenticated
  return children
}
