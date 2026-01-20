import React, { useMemo, useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"
import { fetchGraphs } from "../api/graph"

const API_URL = import.meta.env.VITE_API_BASE

export default function Home() {
  const [graphs, setGraphs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const data = await fetchGraphs()
        setGraphs(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = useMemo(
    () =>
      graphs.filter(
        (r) =>
          r.name.toLowerCase().includes(query.trim().toLowerCase()) ||
          String(r.id).toLowerCase().includes(query.trim().toLowerCase())
      ),
    [graphs, query]
  )

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg">Betöltés...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Navbar />

      <main className="max-w-5xl min-w-4xl mx-auto p-6 flex-1 overflow-hidden flex flex-col">
        <h1 className="text-3xl font-bold mb-4">Welcome to Softwarename</h1>

        <section className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search (id or name)</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:border-indigo-300"
          />
        </section>

        <section className="flex-1 overflow-y-auto rounded-md">
          <div className="text-sm text-gray-600 mb-3">{filtered.length} results</div>

          {loading && <div className="text-center text-gray-500 py-8">Betöltés...</div>}
          {error && <div className="text-center text-red-500 py-8">{error}</div>}

          {/* táblázat - minden sor külön lekerekített csík */}
          {!loading && !error && (
            <div>
              {filtered.map((row) => (
                <div
                  key={row.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/editor/${row.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") navigate(`/editor/${row.id}`)
                  }}
                  className="flex items-center justify-between bg-white rounded-lg p-4 mb-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">ID</span>
                    <span className="font-medium">{row.id}</span>
                  </div>

                  <div className="flex-1 px-6">
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-semibold truncate">{row.name}</div>
                  </div>

                  <div className="w-70 text-sm text-gray-500">
                    <div className="">Created at</div>
                    <div className="text-gray-700">{formatDate(row.created_at)}</div>
                  </div>

                  <div className="w-36 text-sm text-gray-500">
                    <div className="">Created by</div>
                    <div className="text-gray-700">{row.created_by}</div>
                  </div>

                  <div className="w-32 text-right">
                    <span className="inline-block px-3 py-1 text-sm rounded-full font-medium bg-gray-100 text-gray-800 max-w-full truncate">
                      {row.tag || "No tag"}
                    </span>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center text-gray-500 py-8">No results found.</div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
