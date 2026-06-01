import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="card stack-md">
      <h1>Thông tin tài khoản</h1>
      <div className="grid grid-2">
        <div>
          <label>ID</label>
          <input value={user?.id || ''} disabled />
        </div>
        <div>
          <label>Role</label>
          <input value={user?.role || ''} disabled />
        </div>
        <div>
          <label>Username</label>
          <input value={user?.username || ''} disabled />
        </div>
        <div>
          <label>Email</label>
          <input value={user?.email || ''} disabled />
        </div>
        <div className="full-width">
          <label>Họ tên</label>
          <input value={user?.fullName || ''} disabled />
        </div>
      </div>
    </div>
  )
}
