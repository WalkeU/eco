import React from "react"

const NodeInfo = ({ node }) => {
  if (!node) return null
  return (
    <div className="fixed right-6 bottom-6 z-20 bg-white rounded-lg shadow-xl p-4 w-64 border border-gray-200 text-sm">
      <h2 className="text-lg font-bold mb-2 text-gray-800">{node.label}</h2>
      <div className="text-gray-600 mb-1">Type: {node.data?.type}</div>
      {node.data?.description && <div className="text-gray-500 mt-2">{node.data.description}</div>}
      {/* Egyéb adatok megjelenítése (védett: ha nincs `data`, üres objektumot használunk) */}
      {Object.entries(node.data || {})
        .filter(([key]) => key !== "type" && key !== "description")
        .map(([key, value]) => (
          <div key={key} className="text-gray-500">
            {key}: {String(value)}
          </div>
        ))}
    </div>
  )
}

export default NodeInfo
