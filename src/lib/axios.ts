import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => { accessToken = token }
export const getAccessToken = () => accessToken

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        )
        setAccessToken(data.data.accessToken)
        original.headers.Authorization = `Bearer ${data.data.accessToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
