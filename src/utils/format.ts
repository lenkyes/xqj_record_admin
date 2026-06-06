import dayjs from 'dayjs'

export function formatDateTime(value?: string | number | null) {
  if (!value) return '-'
  const result = dayjs(value)
  return result.isValid() ? result.format('YYYY-MM-DD HH:mm') : String(value)
}

export function formatBytes(value?: number | null) {
  if (!value && value !== 0) return '-'
  if (value < 1024) return `${value} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = value / 1024
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`
}

export function asText(value: unknown, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function getField<T = unknown>(row: Record<string, unknown>, keys: string[], fallback?: T) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key] as T
    }
  }
  return fallback as T
}

export function statusLabel(status?: string) {
  if (status === 'active') return '启用'
  if (status === 'disabled') return '禁用'
  if (status === 'published') return '已发布'
  if (status === 'draft') return '草稿'
  return status || '-'
}

export function statusType(status?: string) {
  if (status === 'active' || status === 'success' || status === 'ok') return 'success'
  if (status === 'disabled' || status === 'failed' || status === 'error') return 'danger'
  if (status === 'pending' || status === 'warning') return 'warning'
  return 'info'
}
