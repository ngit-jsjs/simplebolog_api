import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api, getApiErrorMessage } from '../lib/api'
import { formatDate, isAdmin } from '../lib/utils'
import Loading from '../components/Loading'
import StatusBadge from '../components/StatusBadge'

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [blog, setBlog] = useState(null)
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadBlog = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(`/blogs/${slug}`)
      setBlog(response.data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlog()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const handleCommentSubmit = async (event) => {
    event.preventDefault()
    if (!blog) return

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await api.post(`/blogs/${blog.id}/comments`, { content: commentContent })
      setCommentContent('')
      setSuccess('Comment thành công')
      await loadBlog()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa comment này?')) return
    try {
      await api.delete(`/comments/${commentId}`)
      setSuccess('Xóa comment thành công')
      await loadBlog()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleHideComment = async (commentId) => {
    if (!window.confirm('Admin: bạn có muốn ẩn comment này?')) return
    try {
      await api.put(`/admin/comments/${commentId}/hide`)
      setSuccess('Ẩn comment thành công')
      await loadBlog()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleShowComment = async (commentId) => {
    if (!window.confirm('Admin: bạn có muốn hiển thị lại comment này?')) return
    try {
      await api.put(`/admin/comments/${commentId}/show`)
      setSuccess('Hiện comment thành công')
      await loadBlog()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  if (loading) return <Loading />
  if (error && !blog) return <div className="alert alert-error">{error}</div>
  if (!blog) return null

  return (
    <div className="stack-lg">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <article className="card stack-md">
        <div className="row space-between wrap align-start">
          <div>
            <h1>{blog.title}</h1>
            <p className="muted-text">
              Tác giả: <strong>{blog.authorUsername}</strong> • Danh mục: <strong>{blog.categoryName}</strong>
            </p>
          </div>
          <StatusBadge status={blog.status} />
        </div>

        <p className="lead-text">{blog.summary}</p>
        <div className="tag-list">
          {blog.tags?.map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
        <div className="content-box">{blog.content}</div>
        <p className="muted-text small-text">
          Tạo lúc: {formatDate(blog.createdAt)} • Cập nhật: {formatDate(blog.updatedAt)}
        </p>
      </article>

      <section className="card stack-md">
        <div className="row space-between wrap">
          <h2>Comments ({blog.comments?.length || 0})</h2>
        </div>

        {isAuthenticated ? (
          <form className="stack-sm" onSubmit={handleCommentSubmit}>
            <textarea
              rows="4"
              placeholder="Nhập nội dung comment"
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              required
              maxLength={500}
            />
            <button className="btn btn-primary" disabled={submitting} type="submit">
              {submitting ? 'Đang gửi...' : 'Gửi comment'}
            </button>
          </form>
        ) : (
          <div className="alert alert-info">Đăng nhập để bình luận.</div>
        )}

        {(blog.comments || []).length === 0 ? <p className="muted-text">Chưa có comment nào.</p> : null}

        <div className="stack-md">
          {blog.comments?.map((comment) => {
            const isHidden = comment.status === 'HIDDEN'
            const canDelete = user?.username === comment.username || isAdmin(user)
            const canHide = isAdmin(user)

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
                    <p className="muted-text small-text">{formatDate(comment.createdAt)}</p>
                  </div>
                  <div className="row gap-sm wrap">
                    {canHide && (
                      isHidden ? (
                        <button className="btn btn-outline" onClick={() => handleShowComment(comment.id)}>
                          Hiện
                        </button>
                      ) : (
                        <button className="btn btn-warning" onClick={() => handleHideComment(comment.id)}>
                          Ẩn
                        </button>
                      )
                    )}
                    {canDelete && (
                      <button className="btn btn-danger" onClick={() => handleDeleteComment(comment.id)}>
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ textDecoration: isHidden ? 'line-through' : 'none' }}>{comment.content}</p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
