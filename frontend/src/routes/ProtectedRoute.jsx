import React, { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"
import LoadingScreen from "../components/loaders/LoadingScreen"
import * as userApi from "../api/user"

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()
  console.log("[ProtectedRoute] user:", user)

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
