import React, { useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/UserContext"
import LoadingScreen from "../components/loaders/LoadingScreen"

export default function PublicRoute({ children }) {
  const { user, fetchUser, isLoading } = useAuth()
  const location = useLocation()

  useEffect(() => {
    // Csak akkor fetchelünk, ha még nincs user és nem is tölt épp
    if (user === undefined && !isLoading) {
      fetchUser()
    }
  }, [location.pathname, user, fetchUser, isLoading])

  if (user === undefined || isLoading) {
    // Loading state
    return <LoadingScreen />
  }

  if (user !== null) {
    // Already authenticated, redirect to home
    return <Navigate to="/" replace />
  }

  // Not authenticated, allow access
  return children
}
