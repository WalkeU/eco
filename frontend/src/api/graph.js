import { apiFetch } from "./apiFetch"
const apiBase = import.meta.env.VITE_API_BASE

export const fetchGraphs = async (config = {}) => {
  const res = await apiFetch(`${apiBase}/graphs`, config)
  return res.data
}

export const fetchGraph = async (id, config = {}) => {
  const res = await apiFetch(`${apiBase}/graphs/${id}`, config)
  return res.data
}
