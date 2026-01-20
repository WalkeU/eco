import React, { useEffect, useRef, useState } from "react"
import { updateGraph } from "../api/graph"

export default function UpdateGraphModal({ isOpen, onClose, graph, graphId, onSuccess }) {
  const modalRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tag, setTag] = useState("")

  useEffect(() => {
    if (graph) {
      setName(graph.name || "")
      setDescription(graph.description || "")
      setTag(graph.tag || "")
    }
  }, [graph])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleUpdate = async () => {
    try {
      const nodeMap = {}
      graph.nodes.forEach((n) => {
        const cid = n.client_id != null ? n.client_id : n.id
        nodeMap[n.id] = cid
      })
      const transformedEdges = graph.edges.map((e) => ({
        ...e,
        from_client_id: nodeMap[e.from],
        to_client_id: nodeMap[e.to],
      }))
      const payload = { name, description, tag, nodes: graph.nodes, edges: transformedEdges }
      const updated = await updateGraph(graphId, payload)
      onSuccess(updated)
      onClose()
    } catch (err) {
      console.error("Error updating graph:", err)
      alert("Hiba történt a mentés során.")
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={modalRef}
        className={`bg-white/90 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-md w-full transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Update Graph</h2>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="Graph name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="Description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tag</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md"
              placeholder="Tag"
            />
          </div>
        </div>
        <p className="text-gray-700 mb-6">Biztosan frissíted a gráfot az aktuális változtatásokkal?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-gray text-white rounded-md hover:bg-gray-hover"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
