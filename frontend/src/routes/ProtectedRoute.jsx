import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"
import LoadingScreen from "../components/loaders/LoadingScreen"

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

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
