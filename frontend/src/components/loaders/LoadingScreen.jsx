import React from "react"
import HashLoader from "./HashLoader"

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center w-48">
        <HashLoader
          color={getComputedStyle(document.documentElement).getPropertyValue("--color-gray")}
          size={50}
        />
        <div className="text-gray text-lg mt-6">Loading...</div>
      </div>
    </div>
  )
}
