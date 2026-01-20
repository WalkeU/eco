import React from "react"
import { Link, useLocation } from "react-router-dom"

const buttons = [
  { label: "Home", to: "/" },
  { label: "Create", to: "/create" },
  { label: "Upload", to: "/upload" },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="w-full bg-gray py-3 px-8 shadow flex items-center select-none">
      <span className="text-white text-xl font-bold mr-8">SoftwareName</span>
      <div className="flex grow justify-end items-center">
        {buttons.map((btn, idx) => {
          const isActive = location.pathname === btn.to
          return (
            <Link
              key={btn.label}
              to={btn.to}
              className={`font-semibold py-1 px-4 rounded-full ${
                isActive ? "bg-bg-active text-black ring-0" : "bg-bg hover:bg-bg-hover text-black ring-0"
              } ${idx < buttons.length - 1 ? "mr-2" : ""}`}
            >
              {btn.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
