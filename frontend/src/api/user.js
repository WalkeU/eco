import { apiFetch } from "./apiFetch"
const apiBase = import.meta.env.VITE_API_BASE

export const login = async ({ username, password }) => {
  const res = await apiFetch(`${apiBase}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { username, password },
  })
  return res.data
}

export const register = async ({ username, email, password }) => {
  const res = await apiFetch(`${apiBase}/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    data: { username, email, password },
  })
  return res.data
}

export const getMe = async () => {
  const res = await apiFetch(`${apiBase}/user/me`, {
    method: "GET",
  })
  return res
}
