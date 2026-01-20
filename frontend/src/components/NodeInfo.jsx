import React, { useState, useEffect } from "react"

const NodeInfo = ({ node, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState("")
  const [icon, setIcon] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (node) {
      setLabel(node.label || "")
      setIcon(node.icon || "")
      setDescription(node.data?.description || "")
    }
  }, [node])

  if (!node) return null

  const handleSave = () => {
    if (onUpdate) {
      const updatedNode = {
        ...node,
        label,
        icon,
        data: {
          ...node.data,
          description,
        },
      }
      onUpdate(updatedNode)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setLabel(node.label || "")
    setIcon(node.icon || "")
    setDescription(node.data?.description || "")
    setIsEditing(false)
  }

  return (
    <div className="fixed right-6 bottom-6 z-20 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200 text-sm">
      {isEditing ? (
        <div>
          <h2 className="text-lg font-bold mb-2 text-gray-800">Edit Node</h2>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700">Icon</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="e.g., assets/svg/factory.svg"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-2 py-1 border rounded text-sm"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">{node.label}</h2>
            {onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Edit
              </button>
            )}
          </div>
          <div className="text-gray-600 mb-1">Type: {node.data?.type}</div>
          {node.data?.description && <div className="text-gray-500 mt-2">{node.data.description}</div>}
          {node.icon && <div className="text-gray-500">Icon: {node.icon}</div>}
          {/* Egyéb adatok megjelenítése (védett: ha nincs `data`, üres objektumot használunk) */}
          {Object.entries(node.data || {})
            .filter(([key]) => key !== "type" && key !== "description")
            .map(([key, value]) => (
              <div key={key} className="text-gray-500">
                {key}: {String(value)}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default NodeInfo
