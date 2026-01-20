import React from "react"
import { resolveIcon } from "../constants/icons"

const NODE_TYPES = [
  {
    type: "factory",
    label: "Factory",
    icon: "assets/svg/factory.svg",
  },
  {
    type: "solar",
    label: "Solar Panel",
    icon: "assets/svg/solar.svg",
  },
  {
    type: "warehouse",
    label: "Warehouse",
    icon: "assets/svg/building.svg",
  },
  {
    type: "battery",
    label: "Battery",
    icon: "assets/svg/battery.svg",
  },
  {
    type: "substation",
    label: "Substation",
    icon: "assets/svg/substation.svg",
  },
  {
    type: "nuclear",
    label: "Nuclear",
    icon: "assets/svg/nuclear.svg",
  },
]

export default function NodePalette({ onDragStart }) {
  const handleDragStart = (e, nodeType) => {
    e.dataTransfer.setData("application/json", JSON.stringify(nodeType))
    if (onDragStart) onDragStart(nodeType)
  }

  return (
    <aside className="w-52 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg mb-3">Node Palette</span>
        {NODE_TYPES.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm cursor-grab hover:shadow-md transition-shadow"
          >
            <img src={resolveIcon(node.icon)} alt={node.label} className="w-8 h-8" />
            <span className="font-medium">{node.label}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
