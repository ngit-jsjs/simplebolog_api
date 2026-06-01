import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'
import { normalizePageData } from '../lib/utils'
import BlogCard from '../components/BlogCard'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'

export default function HomePage() {
  const [blogsPage, setBlogsPage] = useState(normalizePageData())
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ keyword: '', categoryId: '', tagId: '', page: 0 })

  const loadCatalogs = async () => {
    const [categoriesRes, tagsRes] = await Promise.all([api.get('/categories'), api.get('/tags')])
    setCategories(categoriesRes.data)
    setTags(tagsRes.data)
  }

  const loadBlogs = async (nextFilters = filters) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/blogs', {
        params: {
          keyword: nextFilters.keyword || undefined,
          categoryId: nextFilters.categoryId || undefined,
          tagId: nextFilters.tagId || undefined,
          page: nextFilters.page,
          size: 6,
          sort: 'createdAt,desc',
        },
      })
      setBlogsPage(normalizePageData(response.data))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        await loadCatalogs()
      } catch (err) {
        setError(getApiErrorMessage(err))
      }
      await loadBlogs(filters)
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextFilters = { ...filters, page: 0 }
    setFilters(nextFilters)
    await loadBlogs(nextFilters)
  }

  const handlePageChange = async (page) => {
    const nextFilters = { ...filters, page }
    setFilters(nextFilters)
    await loadBlogs(nextFilters)
  }

  return (
    <div className="stack-lg">
      <section className="hero card">
        <h1>Simple Blog</h1>
      </section>

      <section className="card">
        <form className="grid grid-4" onSubmit={handleSubmit}>
          <div>
            <label>Từ khóa</label>
            <input name="keyword" value={filters.keyword} onChange={handleChange} placeholder="Nhập tiêu đề hoặc nội dung" />
          </div>
          <div>
            <label>Category</label>
            <select name="categoryId" value={filters.categoryId} onChange={handleChange}>
              <option value="">Tất cả category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Tag</label>
            <select name="tagId" value={filters.tagId} onChange={handleChange}>
              <option value="">Tất cả tag</option>
              {tags.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn btn-primary" type="submit">
              Lọc bài viết
            </button>
          </div>
        </form>
      </section>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? <Loading /> : null}

      {!loading && !error && blogsPage.content.length === 0 ? (
        <EmptyState title="Chưa có bài viết nào" description="Hãy thử đổi bộ lọc hoặc kiểm tra dữ liệu mẫu từ backend." />
      ) : null}

      <div className="grid grid-2">
        {blogsPage.content.map((blog) => (
          <BlogCard blog={blog} key={blog.id} />
        ))}
      </div>

      <Pagination page={blogsPage} onChange={handlePageChange} />
    </div>
  )
}
