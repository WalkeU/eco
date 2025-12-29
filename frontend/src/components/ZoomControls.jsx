import React from "react"

export default function ZoomControls({ onZoomIn, onZoomOut, onFit, position }) {
  const posClass = position === "left" ? "left-4 bottom-4" : "right-4 bottom-4"
  return (
    <div className={`absolute ${posClass} flex flex-row gap-2 z-10`}>
      <button
        className="w-10 h-10 rounded-full border-none bg-white shadow-md text-lg cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
        title="Fit to screen"
        onClick={onFit}
      >
        ⤢
      </button>
      <button
        className="w-10 h-10 rounded-full border-none bg-white shadow-md text-2xl cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
        title="Zoom out"
        onClick={onZoomOut}
      >
        −
      </button>
      <button
        className="w-10 h-10 rounded-full border-none bg-white shadow-md text-2xl cursor-pointer flex items-center justify-center hover:bg-gray-100 transition"
        title="Zoom in"
        onClick={onZoomIn}
      >
        +
      </button>
    </div>
  )
}
