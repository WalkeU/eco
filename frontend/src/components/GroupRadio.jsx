import React from "react"

export default function GroupRadio({ label, value, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 mb-2 cursor-pointer">
      <input
        type="radio"
        name="group"
        value={value}
        checked={checked}
        onChange={onChange}
        className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4"
      />
      <span className="text-gray-700 text-base">{label}</span>
    </label>
  )
}
