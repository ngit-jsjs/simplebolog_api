import { Link } from 'react-router-dom'
import { formatDate } from '../lib/utils'
import StatusBadge from './StatusBadge'

export default function BlogCard({ blog, showOwnerActions = false, onDelete }) {
  return (
    <article className="card blog-card">
      <div className="blog-card-top">
        <div>
          <h3 className="blog-card-title">
            <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
          </h3>
          <p className="muted-text">
            Tác giả: <strong>{blog.authorUsername}</strong> • Danh mục: <strong>{blog.categoryName}</strong>
          </p>
        </div>
        <StatusBadge status={blog.status} />
      </div>

      <p>{blog.summary}</p>

      <div className="tag-list">
        {blog.tags?.map((tag) => (
          <span className="tag-chip" key={tag}>
            #{tag}
          </span>
        ))}
      </div>

      <p className="muted-text small-text">
        Tạo lúc: {formatDate(blog.createdAt)}
        {blog.publishedAt ? ` • Publish: ${formatDate(blog.publishedAt)}` : ''}
      </p>

      {showOwnerActions && (
        <div className="row gap-sm wrap">
          <Link className="btn btn-primary" to={`/blogs/${blog.id}/edit`}>
            Sửa
          </Link>
          <button className="btn btn-danger" onClick={() => onDelete?.(blog.id)}>
            Xóa
          </button>
        </div>
      )}
    </article>
  )
}
