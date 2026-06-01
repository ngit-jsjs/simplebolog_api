import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiErrorMessage } from '../lib/api'
import { normalizePageData } from '../lib/utils'
import BlogCard from '../components/BlogCard'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'

export default function MyBlogsPage() {
  const [pageData, setPageData] = useState(normalizePageData())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async (page = 0) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/my/blogs', {
        params: {
          page,
          size: 10,
          sort: 'createdAt,desc',
        },
      })
      setPageData(normalizePageData(response.data))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (blogId) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa blog này?')
    if (!confirmed) return

    try {
      const response = await api.delete(`/blogs/${blogId}`)
      setSuccess(response.data.message || 'Xóa blog thành công')
      await loadData(pageData.number)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="stack-lg">
      <div className="row space-between wrap">
        <div>
          <h1>Bài viết của tôi</h1>
        </div>
        <Link className="btn btn-primary" to="/blogs/new">
          Tạo blog mới
        </Link>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Loading /> : null}

      {!loading && pageData.content.length === 0 ? (
        <EmptyState title="Bạn chưa có blog nào" description="Hãy tạo bài viết đầu tiên của bạn." />
      ) : null}

      <div className="grid grid-2">
        {pageData.content.map((blog) => (
          <BlogCard blog={blog} key={blog.id} showOwnerActions onDelete={handleDelete} />
        ))}
      </div>

      <Pagination page={pageData} onChange={loadData} />
    </div>
  )
}
