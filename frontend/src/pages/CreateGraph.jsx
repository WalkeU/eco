import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/UserContext"
import Graph from "../components/Graph.jsx"
import Canvas from "../components/Canvas.jsx"
import Navbar from "../components/Navbar.jsx"
import NodeInfo from "../components/NodeInfo.jsx"
import SaveGraphModal from "../components/SaveGraphModal.jsx"
import NodePalette from "../components/NodePalette.jsx"

// CreateGraph: új gráf létrehozására szolgál, üres állapottal indul.
function CreateGraph() {
  const [graph, setGraph] = useState({ nodes: [], edges: [] })
  const [activeNodeId, setActiveNodeId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Node pozíció frissítése
  const handleNodePositionChange = (publicId, x, y) => {
    setGraph((prev) => {
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

  // Aktív node beállítása
  const handleNodeSelect = (publicId) => {
    setActiveNodeId(publicId)
  }

  const activeNode = graph.nodes.find((n) => {
    const pid = n.client_id != null ? (isFinite(n.client_id) ? Number(n.client_id) : n.client_id) : n.id
    return pid === activeNodeId
  })

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleEdgeCreate = (from, to) => {
    setGraph((prev) => ({
      ...prev,
      edges: [...prev.edges, { from, to }],
    }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const data = e.dataTransfer.getData("application/json")
    if (!data) return
    const nodeType = JSON.parse(data)
    // Pozíció számítása (egyszerűsítve, center környékére)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - 40 // offset for node size
    const y = e.clientY - rect.top - 40
    const newNode = {
      client_id: Date.now().toString(), // unique id
      label: nodeType.label,
      x: x,
      y: y,
      icon: nodeType.icon,
      data: { type: nodeType.type }, // alap data csak type
    }
    setGraph((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 w-full flex flex-row">
        <NodePalette />
        <div className="flex-1 flex flex-col relative">
          {/* Save gomb a jobb felső sarokban */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Graph
            </button>
          </div>
          {/* Canvas a gráfhoz */}
          <div
            className="flex-1 flex items-center justify-center relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Canvas enablePan={false} enableZoom={false}>
              <Graph
                graph={graph}
                onNodePositionChange={handleNodePositionChange}
                onNodeSelect={handleNodeSelect}
                onEdgeCreate={handleEdgeCreate}
                activeNodeId={activeNodeId}
              />
            </Canvas>
            {activeNode && <NodeInfo node={activeNode} />}
          </div>
        </div>
      </div>
      <SaveGraphModal isOpen={isModalOpen} onClose={handleCloseModal} graph={graph} />
    </div>
  )
}

export default CreateGraph
