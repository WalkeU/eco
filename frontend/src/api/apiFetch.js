import axios from "axios"

// General API fetch utility using axios
// Supports httpOnly cookie-based auth (withCredentials)
// If you use httpOnly cookies, token param is not needed
export const apiFetch = (url, config = {}) => {
  const token = localStorage.getItem("accessToken")
  const headers = { ...(config.headers || {}) }
  if (token) headers["Authorization"] = `Bearer ${token}`
  return axios({
    url,
    ...config,
    headers,
  })
}
