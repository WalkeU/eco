import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"

export default function Auth() {
  const [mode, setMode] = useState("login") // 'login' or 'register'
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const apiBase = import.meta.env.VITE_API_BASE
  const { login, register, isAuthenticated } = useAuth()

  // Ha a user be van jelentkezve, irányítsuk át a főoldalra
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/")
    }
  }, [isAuthenticated, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      if (mode === "register") {
        await register({ username, email, password })
        setMode("login")
        return
      }

      await login({ username, password })
      navigate("/")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">{mode === "login" ? "Bejelentkezés" : "Regisztráció"}</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="block text-sm text-gray-600">Felhasználónév</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          {mode === "register" && (
            <div className="mb-3">
              <label className="block text-sm text-gray-600">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm text-gray-600">Jelszó</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
              {mode === "login" ? "Bejelentkezés" : "Regisztráció"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login")
                setError(null)
              }}
              className="text-sm text-gray-600"
            >
              {mode === "login" ? "Nincs fiókod? Regisztrálj" : "Van már fiókod? Jelentkezz be"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
