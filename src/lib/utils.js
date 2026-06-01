export function formatDate(value) {
  if (!value) return '---'
  try {
    return new Date(value).toLocaleString('vi-VN')
  } catch {
    return value
  }
}

export function isAdmin(user) {
  return user?.role === 'ADMIN'
}

export function normalizePageData(pageData) {
  return {
    content: pageData?.content || [],
    number: pageData?.number || 0,
    totalPages: pageData?.totalPages || 0,
    totalElements: pageData?.totalElements || 0,
    first: pageData?.first ?? true,
    last: pageData?.last ?? true,
  }
}
