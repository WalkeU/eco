import React, { useState } from "react"
import GroupRadio from "./GroupRadio"

const GROUPS = [
  { label: "Solar West", value: "solar-west" },
  { label: "Solar East", value: "solar-east" },
  { label: "Wind North", value: "wind-north" },
  { label: "Wind South", value: "wind-south" },
  { label: "Hydro Central", value: "hydro-central" },
]

export default function Sidebar() {
  const [selected, setSelected] = useState(GROUPS[0].value)
  return (
    <aside className="w-52 bg-gray-50 border-r border-gray-200 p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="font-bold text-lg mb-3">Groups</span>
        {GROUPS.map((g) => (
          <GroupRadio
            key={g.value}
            label={g.label}
            value={g.value}
            checked={selected === g.value}
            onChange={() => setSelected(g.value)}
          />
        ))}
      </div>
    </aside>
  )
}
