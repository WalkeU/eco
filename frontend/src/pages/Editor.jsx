import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import Graph from "../components/Graph.jsx"
import Canvas from "../components/Canvas.jsx"
import Navbar from "../components/Navbar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import NodeInfo from "../components/NodeInfo.jsx"

// Editor: lekéri a gráfot a backendből és a `Graph` komponensnek a `graph` propban adja át.
function Editor() {
  const { id } = useParams()
  const [graph, setGraph] = useState(null)
  const [activeNodeId, setActiveNodeId] = useState(null)

  // Lekérés a backendről. A Vite env-ben beállítható `VITE_API_BASE`.
  const API_BASE = import.meta.env.VITE_API_BASE
  useEffect(() => {
    let mounted = true
    if (!id) return () => (mounted = false)
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/graphs/${id}`)
        const text = await res.text()
        if (!res.ok) throw new Error(`Failed to fetch graph: ${res.status} ${text}`)
        const g = JSON.parse(text)
        if (mounted) setGraph(g)
      } catch (err) {
        console.error("Error fetching graph:", err)
      }
    })()
    return () => (mounted = false)
  }, [API_BASE, id])

  // Node pozíció frissítése: a Graph komponens public id-t ad vissza (client_id vagy szám)
  const handleNodePositionChange = (publicId, x, y) => {
    setGraph((prev) => {
      if (!prev) return prev
      const nodes = prev.nodes.map((node) => {
        const pid =
          node.client_id != null
            ? isFinite(node.client_id)
              ? Number(node.client_id)
              : node.client_id
            : node.id
        if (pid === publicId) return { ...node, x, y }
        return node
      })
      return { ...prev, nodes }
    })
  }

  // Aktív node beállítása (public id)
  const handleNodeSelect = (publicId) => {
    setActiveNodeId(publicId)
  }

  const activeNode =
    graph && graph.nodes
      ? graph.nodes.find((n) => {
          const pid = n.client_id != null ? (isFinite(n.client_id) ? Number(n.client_id) : n.client_id) : n.id
          return pid === activeNodeId
        })
      : null

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 w-full flex flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Canvas>
            <Graph
              graph={graph}
              onNodePositionChange={handleNodePositionChange}
              onNodeSelect={handleNodeSelect}
              activeNodeId={activeNodeId}
            />
          </Canvas>
          {activeNode && <NodeInfo node={activeNode} />}
        </div>
      </div>
    </div>
  )
}

export default Editor
