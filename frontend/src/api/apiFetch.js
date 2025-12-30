import axios from "axios"

// Saját axios példány, minden kérésnél withCredentials: true
export const apiClient = axios.create({
  withCredentials: true,
})

// General API fetch utility using axios
export const apiFetch = (url, config = {}) => {
  const headers = { ...(config.headers || {}) }
  return apiClient({
    url,
    ...config,
    headers,
  })
}
