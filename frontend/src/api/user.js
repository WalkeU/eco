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

export const getMe = async (config = {}) => {
  const res = await apiFetch(`${apiBase}/user/me`, {
    method: "GET",
    ...config,
  })
  return res
}

export const refresh = async () => {
  try {
    const res = await apiFetch(`${apiBase}/user/refresh`, {
      method: "POST",
    })
    return res.data
  } catch (err) {
    // Itt ne logolj semmit, csak dobj vissza null-t vagy false-t
    return null
  }
}

export const logout = async () => {
  const res = await apiFetch(`${apiBase}/user/logout`, {
    method: "POST",
  })
  return res.data
}
