import React, { useRef, useState, useEffect } from "react"
import { resolveIcon } from "../constants/icons"

// Node és Edge típusok
// Node: { id, x, y, label }
// Edge: { from, to }

export const NODE_SIZE = 80 // négyzet oldalhossz
const NODE_RADIUS = 16 // sarkok lekerekítése

export default function Graph({
  nodes,
  edges,
  graph,
  onNodePositionChange,
  onNodeSelect,
  onEdgeCreate,
  onEdgeDelete,
  activeNodeId,
  viewBox,
}) {
  const [draggedNodeId, setDraggedNodeId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Drag start
  const handleMouseDown = (e, node) => {
    e.stopPropagation()
    // Az egér pozícióját átalakítjuk SVG koordinátára
    const svg = e.target.ownerSVGElement || e.target
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse())
    // Prefer client_id (frontend-provided id) if present so Editor's state matches
    const publicId =
      node.client_id != null ? (isFinite(node.client_id) ? Number(node.client_id) : node.client_id) : node.id
    if (e.shiftKey && activeNodeId && activeNodeId !== publicId) {
      // Check if edge already exists
      const usedEdges = graph && graph.edges ? graph.edges : edges || []
      const existingEdge = usedEdges.find(
        (edge) =>
          (edge.from === activeNodeId && edge.to === publicId) ||
          (edge.from === publicId && edge.to === activeNodeId)
      )
      if (existingEdge) {
        // Delete edge
        if (onEdgeDelete) onEdgeDelete(activeNodeId, publicId)
      } else {
        // Create edge
        if (onEdgeCreate) onEdgeCreate(activeNodeId, publicId)
      }
    } else {
      // Normal drag or select
      setDraggedNodeId(publicId)
      setDragOffset({
        x: cursor.x - node.x,
        y: cursor.y - node.y,
      })
      if (onNodeSelect) onNodeSelect(publicId)
    }
  }

  // Drag move & end: window szintű listener
  useEffect(() => {
    if (draggedNodeId === null) return
    const handleMouseMove = (e) => {
      // Egér pozíció SVG koordinátára
      const svg = document.querySelector("svg")
      if (!svg) return
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const cursor = pt.matrixTransform(svg.getScreenCTM().inverse())
      const newX = cursor.x - dragOffset.x
      const newY = cursor.y - dragOffset.y
      // draggedNodeId is already the publicId
      if (onNodePositionChange) onNodePositionChange(draggedNodeId, newX, newY)
    }
    const handleMouseUp = () => {
      setDraggedNodeId(null)
    }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggedNodeId, dragOffset, onNodePositionChange])

  // Attach listeners only a clickre
  const usedNodes = graph && graph.nodes ? graph.nodes : nodes || []
  const usedEdges = graph && graph.edges ? graph.edges : edges || []

  return (
    <g>
      {/* Edges */}
      {usedEdges.map((edge, i) => {
        let fromNode = usedNodes.find((n) => n.id === edge.from)
        if (!fromNode) {
          fromNode = usedNodes.find((n) => {
            const pid =
              n.client_id != null ? (isFinite(n.client_id) ? Number(n.client_id) : n.client_id) : n.id
            return pid === edge.from
          })
        }
        let toNode = usedNodes.find((n) => n.id === edge.to)
        if (!toNode) {
          toNode = usedNodes.find((n) => {
            const pid =
              n.client_id != null ? (isFinite(n.client_id) ? Number(n.client_id) : n.client_id) : n.id
            return pid === edge.to
          })
        }
        if (!fromNode || !toNode) return null
        return (
          <line
            key={i}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke="var(--color-white)"
            strokeWidth={3}
          />
        )
      })}
      {/* Nodes */}
      {usedNodes.map((node) => {
        // A négyzet bal felső sarka:
        const rectX = node.x - NODE_SIZE / 2
        const rectY = node.y - NODE_SIZE / 2
        const publicId =
          node.client_id != null
            ? isFinite(node.client_id)
              ? Number(node.client_id)
              : node.client_id
            : node.id
        const isActive = activeNodeId === publicId
        return (
          <g key={node.id} style={{ cursor: "grab" }} onMouseDown={(e) => handleMouseDown(e, node)}>
            <rect
              x={rectX}
              y={rectY}
              width={NODE_SIZE}
              height={NODE_SIZE}
              rx={NODE_RADIUS}
              ry={NODE_RADIUS}
              fill={isActive ? "var(--color-bg)" : "var(--color-bg)"}
              stroke={isActive ? "var(--color-white)" : "var(--color-black)"}
              strokeWidth={isActive ? 2 : 2}
              filter={isActive ? "drop-shadow(0 4px 12px #0004)" : "drop-shadow(0 2px 4px #0002)"}
              style={{ transition: "stroke 0.2s, filter 0.4s" }}
            />
            {/* SVG vagy React elem a node közepén, ha van */}
            {node.icon && (
              <g transform={`translate(${node.x},${node.y})`} style={{ pointerEvents: "none" }}>
                {typeof node.icon === "string" ? (
                  <image href={resolveIcon(node.icon)} width={40} height={40} x={-20} y={-20} />
                ) : (
                  node.icon
                )}
              </g>
            )}
            {/* Label a node alatt vagy felett */}
            {node.label && (
              <text
                className="select-none font-bold text-[18px] fill-black text-center"
                x={node.x}
                y={node.y + NODE_SIZE / 2 + 20}
                textAnchor="middle"
                pointerEvents="none"
              >
                {node.label}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}
