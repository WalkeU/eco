import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

import Graph from "../components/Graph.jsx"
import Canvas from "../components/Canvas.jsx"
import Navbar from "../components/Navbar.jsx"
import Sidebar from "../components/Sidebar.jsx"
import NodeInfo from "../components/NodeInfo.jsx"
import UpdateGraphModal from "../components/UpdateGraphModal.jsx"

import { fetchGraph } from "../api/graph"

// Editor: lekéri a gráfot a backendből és a `Graph` komponensnek a `graph` propban adja át.
function Editor() {
  const { id } = useParams()
  const [graph, setGraph] = useState(null)
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  // Lekérés a backendről. A Vite env-ben beállítható `VITE_API_BASE`.
  useEffect(() => {
    const ac = new AbortController()
    if (!id) return () => ac.abort()
    ;(async () => {
      try {
        const g = await fetchGraph(id, { signal: ac.signal })
        setGraph(g)
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError")
          console.error("Error fetching graph:", err)
      }
    })()
    return () => ac.abort()
  }, [id])

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

  // Modal megnyitása
  const handleOpenUpdateModal = () => {
    setIsUpdateModalOpen(true)
  }

  // Modal bezárása
  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false)
  }

  // Sikeres frissítés után
  const handleUpdateSuccess = (updated) => {
    setGraph(updated)
    alert("Gráf elmentve!")
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
          <button
            onClick={handleOpenUpdateModal}
            className="absolute top-4 right-4 z-10 font-semibold py-1 px-4 rounded-full bg-gray hover:bg-gray-hover text-white shadow"
          >
            Gráf mentése
          </button>
          <Canvas>
            <Graph
              graph={graph}
              onNodePositionChange={handleNodePositionChange}
              onNodeSelect={handleNodeSelect}
              activeNodeId={activeNodeId}
            />
          </Canvas>
          {activeNode && <NodeInfo node={activeNode} />}
          <UpdateGraphModal
            isOpen={isUpdateModalOpen}
            onClose={handleCloseUpdateModal}
            graph={graph}
            graphId={id}
            onSuccess={handleUpdateSuccess}
          />
        </div>
      </div>
    </div>
  )
}

export default Editor
