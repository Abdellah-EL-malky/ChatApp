import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chatapp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('chatapp_token')
    localStorage.removeItem('chatapp_user')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)
export const getMe = () => api.get('/api/users/me')
export const searchUsers = (q) => api.get(`/api/users/search?q=${q}`)
export const getOnlineUsers = () => api.get('/api/users/online')
export const getPublicRooms = () => api.get('/api/rooms/public')
export const getMyRooms = () => api.get('/api/rooms/mine')
export const createRoom = (data) => api.post('/api/rooms', data)
export const joinRoom = (id) => api.post(`/api/rooms/${id}/join`)
export const getRoom = (id) => api.get(`/api/rooms/${id}`)
export const getMessages = (roomId) => api.get(`/api/rooms/${roomId}/messages`)
export const getNotifications = () => api.get('/api/notifications')
export const getNotificationCount = () => api.get('/api/notifications/count')
export const markRoomRead = (roomId) => api.post(`/api/notifications/read/room/${roomId}`)

export default api
