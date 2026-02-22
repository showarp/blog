// 共享工具函数

/**
 * 格式化日期为英文格式 (e.g., "January 1, 2024")
 */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 标准化 Notion ID（移除横杠）
 */
export function normalizeId(id: string): string {
  return id.replace(/-/g, '')
}
