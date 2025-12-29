import React, { useRef, useState, useEffect } from "react"
import ZoomControls from "./ZoomControls"

/**
 * Canvas: zoomolható, pannolható wrapper SVG-hez vagy bármilyen tartalomhoz
 * Props:
 *   width, height: pixel méret
 *   children: renderelendő tartalom (pl. Graph)
 */

export default function Canvas({ children }) {
  const svgRef = useRef(null)
  const [size, setSize] = useState({ width: 100, height: 100 })
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 100, h: 100 })
  const [drag, setDrag] = useState(null)

  // Méret figyelése
  useEffect(() => {
    function updateSize() {
      if (svgRef.current && svgRef.current.parentElement) {
        const rect = svgRef.current.parentElement.getBoundingClientRect()
        setSize({ width: rect.width, height: rect.height })
        setViewBox((v) => ({ ...v, w: rect.width, h: rect.height }))
      } else {
        setSize({ width: window.innerWidth, height: window.innerHeight })
        setViewBox((v) => ({ ...v, w: window.innerWidth, h: window.innerHeight }))
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Panning
  const handleMouseDown = (e) => {
    setDrag({
      x: e.clientX,
      y: e.clientY,
      origX: viewBox.x,
      origY: viewBox.y,
    })
  }
  const handleMouseMove = (e) => {
    if (drag) {
      const dx = (e.clientX - drag.x) * (viewBox.w / size.width)
      const dy = (e.clientY - drag.y) * (viewBox.h / size.height)
      setViewBox((v) => ({ ...v, x: drag.origX - dx, y: drag.origY - dy }))
    }
  }
  const handleMouseUp = () => setDrag(null)

  // Zoom (scroll)
  const handleWheel = (e) => {
    e.preventDefault()
    const scale = e.deltaY < 0 ? 0.9 : 1.1
    const mx = e.nativeEvent.offsetX
    const my = e.nativeEvent.offsetY
    zoomAt(scale, mx, my)
  }

  // Zoom by button (centered)
  const handleZoom = (scale) => {
    // center of the canvas
    const mx = size.width / 2
    const my = size.height / 2
    zoomAt(scale, mx, my)
  }

  // Zoom logic
  const zoomAt = (scale, mx, my) => {
    setViewBox((v) => {
      const newW = v.w * scale
      const newH = v.h * scale
      // Zoom center: mouse position
      const zx = v.x + (mx / size.width) * (v.w - newW)
      const zy = v.y + (my / size.height) * (v.h - newH)
      return { x: zx, y: zy, w: newW, h: newH }
    })
  }

  // Fit to screen
  const handleFit = () => {
    setViewBox({ x: 0, y: 0, w: size.width, h: size.height })
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        className="shadow-md touch-none block bg-bg"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child) ? React.cloneElement(child, { viewBox }) : child
        )}
      </svg>
      {/* Floating zoom buttons as separate component */}
      <ZoomControls
        onZoomIn={() => handleZoom(0.9)}
        onZoomOut={() => handleZoom(1.1)}
        onFit={handleFit}
        position="left"
      />
    </div>
  )
}
