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

  const handleEdgeDelete = (from, to) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.filter(
        (edge) => !(edge.from === from && edge.to === to) && !(edge.from === to && edge.to === from)
      ),
    }))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const data = e.dataTransfer.getData("application/json")
    if (!data) return
    const nodeType = JSON.parse(data)
    // Pozíció számítása SVG koordinátákra (pan/zoom figyelembe vételével)
    const svg = document.querySelector("svg")
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const cursor = pt.matrixTransform(svg.getScreenCTM().inverse())
    const x = cursor.x // Node center at cursor
    const y = cursor.y
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
          <button
            onClick={handleOpenModal}
            className="absolute top-4 right-4 z-10 font-semibold py-1 px-4 rounded-full bg-gray hover:bg-gray-hover text-white shadow"
          >
            Save Graph
          </button>
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
                onEdgeDelete={handleEdgeDelete}
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
