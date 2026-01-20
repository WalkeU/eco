import React, { useState, useEffect, useRef } from "react"
import { createGraph } from "../api/graph"
import { useAuth } from "../context/UserContext"
import { useNavigate } from "react-router-dom"

export default function SaveGraphModal({ isOpen, onClose, graph }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tag, setTag] = useState("")
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const modalRef = useRef(null)

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

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please enter a name for the graph.")
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        tag,
        nodes: graph.nodes,
        edges: graph.edges,
        created_by: user.id,
      }
      const newGraph = await createGraph(payload)
      onClose()
      navigate(`/editor/${newGraph.id}`)
    } catch (err) {
      console.error("Error saving graph:", err)
      alert("Failed to save graph.")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white backdrop-blur-md p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Save Graph</h2>
        <div className="space-y-4">
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
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gray text-white rounded-md hover:bg-gray-hover disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}
