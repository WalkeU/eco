import axios from "axios"
const apiBase = import.meta.env.VITE_API_BASE

// Külső logout callback (beállítja a UserContext)
let onGlobalLogout = null
export function setGlobalLogoutHandler(fn) {
  onGlobalLogout = fn
}

export const apiClient = axios.create({
  withCredentials: true,
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    // Ne próbáljunk refreshelni a /user/refresh endpointnál és ha skipRefresh flag van
    const shouldSkipRefresh =
      originalRequest.url?.includes("/user/refresh") || originalRequest.skipRefresh === true

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err))
      }
      originalRequest._retry = true
      isRefreshing = true
      try {
        await apiClient.post(`${apiBase}/user/refresh`)
        isRefreshing = false
        processQueue(null, null)
        return apiClient(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError, null)
        // Itt hívjuk meg a globális logoutot, ha van
        if (onGlobalLogout) onGlobalLogout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export const apiFetch = (url, config = {}) => {
  const headers = { ...(config.headers || {}) }
  return apiClient({
    url,
    ...config,
    headers,
  })
}
