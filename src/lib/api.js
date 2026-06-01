import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || '/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(error) {
  const data = error?.response?.data

  if (data?.fieldErrors && typeof data.fieldErrors === 'object') {
    const firstFieldError = Object.values(data.fieldErrors)[0]
    if (firstFieldError) return firstFieldError
  }

  return data?.message || error?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
}
