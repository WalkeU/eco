import React, { useRef, useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"

export default function Upload() {
  const fileInputRef = useRef(null)
  const [filesLabel, setFilesLabel] = useState("")
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth")
  }, [isAuthenticated, navigate])

  const handleBrowse = () => fileInputRef.current?.click()
  const handleFiles = (e) => {
    const names = Array.from(e.target.files || []).map((f) => f.name)
    setFilesLabel(names.join(", "))
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div
            role="button"
            tabIndex={0}
            onClick={handleBrowse}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleBrowse()
            }}
            className="flex flex-col items-center justify-center gap-4 bg-white border-2 border-dashed border-gray-300 rounded-lg p-10 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
          >
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {/* increased strokeWidth to make the plus sign thicker */}
              <path strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>

            <div className="text-lg font-semibold text-gray">Drop files here</div>
            <div className="text-sm text-gray">or select</div>

            <div className="mt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleBrowse()
                }}
                className="px-4 py-2 bg-gray text-white rounded-md text-sm shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Browse
              </button>
            </div>

            {filesLabel && (
              <div className="mt-3 text-sm text-gray-600 truncate w-full text-center">{filesLabel}</div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFiles}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      </main>
    </div>
  )
}
