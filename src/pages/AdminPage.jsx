import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import { normalizePageData } from '../lib/utils'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'

const initialCategory = { name: '', description: '' }
const initialTag = { name: '' }

export default function AdminPage() {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [users, setUsers] = useState([])
  const [publishedBlogs, setPublishedBlogs] = useState(normalizePageData())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categoryForm, setCategoryForm] = useState(initialCategory)
  const [tagForm, setTagForm] = useState(initialTag)

  // Quản lý trạng thái duyệt bài viết
  const [adminBlogs, setAdminBlogs] = useState(normalizePageData())
  const [adminFilters, setAdminFilters] = useState({ keyword: '', status: 'PENDING', page: 0 })
  const [adminLoading, setAdminLoading] = useState(false)

  const loadAdminBlogs = async (nextFilters = adminFilters) => {
    setAdminLoading(true)
    try {
      const response = await api.get('/admin/blogs', {
        params: {
          status: nextFilters.status || undefined,
          keyword: nextFilters.keyword || undefined,
          page: nextFilters.page,
          size: 5,
          sort: 'createdAt,desc',
        },
      })
      setAdminBlogs(normalizePageData(response.data))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setAdminLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [categoriesRes, tagsRes, usersRes, blogsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/tags'),
        api.get('/admin/users'),
        api.get('/blogs', { params: { page: 0, size: 10, sort: 'createdAt,desc' } }),
      ])
      setCategories(categoriesRes.data)
      setTags(tagsRes.data)
      setUsers(usersRes.data)
      setPublishedBlogs(normalizePageData(blogsRes.data))
      await loadAdminBlogs(adminFilters)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateCategory = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const response = await api.post('/admin/categories', categoryForm)
      setSuccess(`Tạo category thành công: ${response.data.name}`)
      setCategoryForm(initialCategory)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleCreateTag = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      const response = await api.post('/admin/tags', tagForm)
      setSuccess(`Tạo tag thành công: ${response.data.name}`)
      setTagForm(initialTag)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleChangeRole = async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role })
      setSuccess(`Đổi role thành công cho ${response.data.username}`)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleAdminSearchSubmit = async (event) => {
    event.preventDefault()
    const nextFilters = { ...adminFilters, page: 0 }
    setAdminFilters(nextFilters)
    await loadAdminBlogs(nextFilters)
  }

  const handleAdminPageChange = async (page) => {
    const nextFilters = { ...adminFilters, page }
    setAdminFilters(nextFilters)
    await loadAdminBlogs(nextFilters)
  }

  const handlePublish = async (blogId) => {
    setError('')
    setSuccess('')
    try {
      const response = await api.put(`/admin/blogs/${blogId}/publish`)
      setSuccess(`Đã duyệt bài viết: ${response.data.title}`)
      await loadAdminBlogs(adminFilters)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleHideComment = async (commentId) => {
    try {
      await api.put(`/admin/comments/${commentId}/hide`)
      setSuccess('Đã ẩn comment thành công')
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleShowComment = async (commentId) => {
    try {
      await api.put(`/admin/comments/${commentId}/show`)
      setSuccess('Đã hiển thị lại comment thành công')
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleDeleteBlog = async (blogId) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi hệ thống không?')
    if (!confirmed) return

    setError('')
    setSuccess('')
    try {
      const response = await api.delete(`/blogs/${blogId}`)
      setSuccess(response.data?.message || 'Xóa bài viết thành công')
      await loadAdminBlogs(adminFilters)
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleDeleteComment = async (commentId) => {
    const confirmed = window.confirm('Bạn có chắc chắn muốn XÓA bình luận này không?')
    if (!confirmed) return

    setError('')
    setSuccess('')
    try {
      const response = await api.delete(`/comments/${commentId}`)
      setSuccess(response.data?.message || 'Xóa bình luận thành công')
      await loadData()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  if (loading) return <Loading text="Đang tải dữ liệu quản trị..." />

  return (
    <div className="stack-lg">
      <div>
        <h1>Trang quản trị</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="grid grid-2">
        <form className="card stack-sm" onSubmit={handleCreateCategory}>
          <h2>Tạo category</h2>
          <div>
            <label>Tên category</label>
            <input value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label>Mô tả</label>
            <textarea
              rows="3"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Tạo category
          </button>
        </form>

        <form className="card stack-sm" onSubmit={handleCreateTag}>
          <h2>Tạo tag</h2>
          <div>
            <label>Tên tag</label>
            <input value={tagForm.name} onChange={(e) => setTagForm({ name: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit">
            Tạo tag
          </button>
        </form>
      </div>

      <div className="grid grid-2">
        <section className="card stack-sm">
          <h2>Danh sách category</h2>
          <div className="list-box">
            {categories.map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted-text small-text">{item.description || 'Không có mô tả'}</p>
                </div>
                <span className="tag-chip">#{item.slug}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card stack-sm">
          <h2>Danh sách tag</h2>
          <div className="list-box">
            {tags.map((item) => (
              <div className="list-row" key={item.id}>
                <strong>{item.name}</strong>
                <span className="tag-chip">#{item.slug}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card stack-sm">
        <h2>Quản lý user / role</h2>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Họ tên</th>
                <th>Role</th>
                <th>Đổi role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.fullName}</td>
                  <td>{user.role}</td>
                  <td>
                    <div className="row gap-sm wrap">
                      <button className="btn btn-outline" onClick={() => handleChangeRole(user.id, 'USER')}>
                        USER
                      </button>
                      <button className="btn btn-outline" onClick={() => handleChangeRole(user.id, 'ADMIN')}>
                        ADMIN
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack-sm">
        <h2>Quản lý duyệt bài viết (PENDING & DRAFT)</h2>
        <p className="muted-text">Tìm kiếm, lọc bài viết theo trạng thái và duyệt bài lên trang chủ.</p>
        
        <form className="row gap-sm wrap align-end" onSubmit={handleAdminSearchSubmit}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label>Từ khóa</label>
            <input
              value={adminFilters.keyword}
              onChange={(e) => setAdminFilters((p) => ({ ...p, keyword: e.target.value }))}
              placeholder="Nhập tiêu đề hoặc tóm tắt..."
            />
          </div>
          <div>
            <label>Trạng thái</label>
            <select
              value={adminFilters.status}
              onChange={(e) => setAdminFilters((p) => ({ ...p, status: e.target.value, page: 0 }))}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING">PENDING</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">
            Tìm kiếm
          </button>
        </form>

        {adminLoading && <Loading text="Đang tải danh sách bài viết quản trị..." />}

        {!adminLoading && adminBlogs.content.length === 0 ? (
          <EmptyState title="Không có bài viết nào" description="Không tìm thấy bài viết phù hợp với bộ lọc hiện tại." />
        ) : (
          <div className="table-scroll" style={{ marginTop: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề / Tóm tắt</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {adminBlogs.content.map((blog) => (
                  <tr key={blog.id}>
                    <td>{blog.id}</td>
                    <td>
                      <div className="stack-xs">
                        <strong>{blog.title}</strong>
                        <p className="muted-text small-text">{blog.summary}</p>
                      </div>
                    </td>
                    <td>{blog.authorUsername}</td>
                    <td>
                      <span className="tag-chip" style={{ background: blog.status === 'PUBLISHED' ? '#22c55e' : blog.status === 'PENDING' ? '#f59e0b' : '#6b7280', color: '#fff' }}>
                        {blog.status}
                      </span>
                    </td>
                    <td>
                      <div className="row gap-sm">
                        {blog.status === 'PENDING' && (
                          <button className="btn btn-primary btn-sm" onClick={() => handlePublish(blog.id)}>
                            Duyệt bài
                          </button>
                        )}
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBlog(blog.id)}>
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={adminBlogs} onChange={handleAdminPageChange} />
      </section>

      <section className="card stack-sm">
        <div className="row space-between wrap">
          <div>
            <h2>Moderate comment trên blog đã publish</h2>
            <p className="muted-text">Các comment bên dưới lấy từ `GET /blogs` rồi theo link sang bài chi tiết, hoặc ẩn trực tiếp tại đây.</p>
          </div>
        </div>

        {publishedBlogs.content.length === 0 ? (
          <EmptyState title="Không có blog publish" description="Hãy publish thêm dữ liệu từ backend để test phần moderation." />
        ) : (
          <div className="stack-md">
            {publishedBlogs.content.map((blog) => (
              <div className="moderation-card" key={blog.id}>
                <div className="row space-between wrap align-start">
                  <div>
                    <h3>{blog.title}</h3>
                    <p className="muted-text small-text">Blog ID: {blog.id}</p>
                  </div>
                  <div className="row gap-sm">
                    <Link className="btn btn-outline" to={`/blogs/${blog.slug}`}>
                      Xem chi tiết
                    </Link>
                    <button className="btn btn-danger" onClick={() => handleDeleteBlog(blog.id)}>
                      Xóa
                    </button>
                  </div>
                </div>

                {!blog.comments?.length ? <p className="muted-text">Bài này chưa có comment.</p> : null}
                <div className="stack-sm">
                  {blog.comments?.map((comment) => {
                    const isHidden = comment.status === 'HIDDEN'
                    return (
                      <div className="comment-card" key={comment.id} style={{ opacity: isHidden ? 0.6 : 1 }}>
                        <div className="row space-between wrap align-start">
                          <div>
                            <div className="row gap-sm align-center">
                              <strong>{comment.username}</strong>
                              {isHidden && (
                                <span className="tag-chip" style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '0.05rem 0.25rem' }}>
                                  [ĐÃ ẨN]
                                </span>
                              )}
                            </div>
                            <p style={{ textDecoration: isHidden ? 'line-through' : 'none' }}>{comment.content}</p>
                          </div>
                          <div className="row gap-sm">
                            {isHidden ? (
                              <button className="btn btn-outline" onClick={() => handleShowComment(comment.id)}>
                                Hiện
                              </button>
                            ) : (
                              <button className="btn btn-warning" onClick={() => handleHideComment(comment.id)}>
                                Ẩn
                              </button>
                            )}
                            <button className="btn btn-danger" onClick={() => handleDeleteComment(comment.id)}>
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
