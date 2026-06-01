import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from './Loading'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loading text="Đang kiểm tra đăng nhập..." />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
