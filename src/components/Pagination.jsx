export default function Pagination({ page, onChange }) {
  if (!page) return null

  const totalPages = page.totalPages || 1

  return (
    <div className="pagination">
      <button disabled={page.first || page.number <= 0} className="btn btn-outline" onClick={() => onChange(page.number - 1)}>
        Trang trước
      </button>
      <span>
        Trang {page.number + 1} / {totalPages}
      </span>
      <button disabled={page.last || page.number + 1 >= totalPages} className="btn btn-outline" onClick={() => onChange(page.number + 1)}>
        Trang sau
      </button>
    </div>
  )
}
