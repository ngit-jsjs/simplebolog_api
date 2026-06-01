import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container nav-row">
          <Link className="brand" to="/">
            Simple Blog
          </Link>

          <nav className="nav-links">
            <NavLink to="/">Trang chủ</NavLink>
            {isAuthenticated && <NavLink to="/my-blogs">Bài của tôi</NavLink>}
            {isAuthenticated && <NavLink to="/profile">Tài khoản</NavLink>}
            {user?.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
          </nav>

          <div className="auth-actions">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">Xin chào, {user?.username}</span>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-outline" to="/login">
                  Đăng nhập
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container page-content">{children}</main>
    </div>
  )
}
