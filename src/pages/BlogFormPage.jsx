import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

const initialForm = {
  title: '',
  summary: '',
  content: '',
  status: 'DRAFT',
  categoryId: '',
  tagIds: [],
}

export default function BlogFormPage({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(initialForm)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [myBlogs, setMyBlogs] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const currentBlog = useMemo(() => myBlogs.find((item) => String(item.id) === String(id)), [myBlogs, id])

  const loadCatalogs = async () => {
    const [categoriesRes, tagsRes] = await Promise.all([api.get('/categories'), api.get('/tags')])
    setCategories(categoriesRes.data)
    setTags(tagsRes.data)
  }

  const loadMyBlogs = async () => {
    const response = await api.get('/my/blogs', {
      params: { page: 0, size: 100, sort: 'createdAt,desc' },
    })
    const blogs = response.data?.content || []
    setMyBlogs(blogs)
    return blogs
  }

  useEffect(() => {
    const init = async () => {
      setError('')
      try {
        await loadCatalogs()
        if (isEdit) {
          const blogs = await loadMyBlogs()
          const target = blogs.find((item) => String(item.id) === String(id))
          if (!target) {
            setError('Không tìm thấy blog trong danh sách bài viết của bạn.')
          } else {
            const matchedTagIds = tags
              .filter((tag) => target.tags?.includes(tag.name))
              .map((tag) => tag.id)
            setForm({
              title: target.title || '',
              summary: target.summary || '',
              content: target.content || '',
              status: target.status || 'DRAFT',
              categoryId: target.categoryId || '',
              tagIds: matchedTagIds,
            })
          }
        }
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  useEffect(() => {
    if (isEdit && currentBlog && tags.length > 0) {
      const matchedTagIds = tags.filter((tag) => currentBlog.tags?.includes(tag.name)).map((tag) => tag.id)
      setForm({
        title: currentBlog.title || '',
        summary: currentBlog.summary || '',
        content: currentBlog.content || '',
        status: currentBlog.status || 'DRAFT',
        categoryId: currentBlog.categoryId || '',
        tagIds: matchedTagIds,
      })
    }
  }, [currentBlog, isEdit, tags])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleTagChange = (tagId) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId) ? prev.tagIds.filter((id) => id !== tagId) : [...prev.tagIds, tagId],
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      tagIds: form.tagIds.map(Number),
    }

    try {
      if (isEdit) {
        await api.put(`/blogs/${id}`, payload)
        setSuccess('Cập nhật blog thành công')
      } else {
        await api.post('/blogs', payload)
        setSuccess('Tạo blog thành công')
        setForm(initialForm)
      }
      setTimeout(() => navigate('/my-blogs'), 700)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="card muted-text">Đang tải dữ liệu form...</div>

  return (
    <div className="stack-lg">
      <div className="row space-between wrap">
        <div>
          <h1>{isEdit ? 'Sửa blog' : 'Tạo blog mới'}</h1>
          <p className="muted-text">Form này khớp với `CreateBlogRequest` và `UpdateBlogRequest` từ backend.</p>
        </div>
        <Link className="btn btn-outline" to="/my-blogs">
          Quay lại bài của tôi
        </Link>
      </div>

      <form className="card stack-md" onSubmit={handleSubmit}>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div>
          <label>Tiêu đề</label>
          <input name="title" value={form.title} onChange={handleChange} minLength={10} maxLength={200} required />
        </div>

        <div>
          <label>Tóm tắt</label>
          <textarea name="summary" value={form.summary} onChange={handleChange} maxLength={300} rows="3" required />
        </div>

        <div>
          <label>Nội dung</label>
          <textarea name="content" value={form.content} onChange={handleChange} rows="10" required />
        </div>

        <div className="grid grid-2">
          <div>
            <label>Trạng thái</label>
            <select name="status" value={form.status} onChange={handleChange} required>
              <option value="DRAFT">DRAFT</option>
              <option value="PENDING">CHỜ DUYỆT (PENDING)</option>
              {isAdmin && <option value="PUBLISHED">PUBLISHED</option>}
            </select>
          </div>
          <div>
            <label>Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Chọn category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Tags</label>
          <div className="checkbox-grid">
            {tags.map((tag) => (
              <label className="checkbox-item" key={tag.id}>
                <input type="checkbox" checked={form.tagIds.includes(tag.id)} onChange={() => handleTagChange(tag.id)} />
                <span>{tag.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật blog' : 'Tạo blog'}
        </button>
      </form>
    </div>
  )
}
