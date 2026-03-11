import axios from 'axios'
import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (error) {
    console.error('Error getting auth token:', error)
  }
  
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on auth error
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// User endpoints
export const users = {
  signup: (userId, email, fullName) =>
    api.post('/users/signup', { user_id: userId, email, full_name: fullName }),
  
  getProfile: (userId) =>
    api.get(`/users/profile/${userId}`),
  
  updateProfile: (userId, fullName) =>
    api.put(`/users/profile/${userId}`, { full_name: fullName }),
}

// Upload endpoints
export const uploads = {
  uploadCSV: (userId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return api.post(`/uploads/csv/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  
  list: (userId, skip = 0, limit = 10) =>
    api.get(`/uploads/list/${userId}`, { params: { skip, limit } }),
  
  getDetail: (uploadId) =>
    api.get(`/uploads/detail/${uploadId}`),
  
  delete: (uploadId, userId) =>
    api.delete(`/uploads/delete/${uploadId}`, { params: { user_id: userId } }),
}

// Insights endpoints
export const insights = {
  generate: (uploadId, userId) =>
    api.post(`/insights/generate/${uploadId}`, { user_id: userId }),
  
  getDetail: (insightId) =>
    api.get(`/insights/detail/${insightId}`),
  
  getByUpload: (uploadId, userId) =>
    api.get(`/insights/by-upload/${uploadId}`, { params: { user_id: userId } }),
  
  export: (insightId, format = 'json') =>
    api.post(`/insights/export/${insightId}`, { format }),
  
  delete: (insightId, userId) =>
    api.delete(`/insights/delete/${insightId}`, { params: { user_id: userId } }),
}

// Subscription endpoints
export const subscriptions = {
  startTrial: (userId) =>
    api.post(`/subscriptions/trial/${userId}`),
  
  getStatus: (userId) =>
    api.get(`/subscriptions/status/${userId}`),
  
  cancel: (userId) =>
    api.post(`/subscriptions/cancel/${userId}`),
  
  getBillingPortal: (userId) =>
    api.get(`/users/billing-portal/${userId}`),
}

export default api
