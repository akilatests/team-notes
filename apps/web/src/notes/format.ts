const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS
const WEEK_DAYS = 7

const shortDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

/** "Just now", "12 min ago", "3 h ago", "Yesterday", "4 days ago", then "Oct 30". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diff = now.getTime() - date.getTime()
  if (diff < MINUTE_MS) return 'Just now'
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)} min ago`
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)} h ago`
  const days = Math.floor(diff / DAY_MS)
  if (days === 1) return 'Yesterday'
  if (days < WEEK_DAYS) return `${days} days ago`
  return shortDate.format(date)
}

export function formatFull(iso: string): string {
  return fullDate.format(new Date(iso))
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

export function snippet(body: string): string {
  const line = body
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0)
  return (line ?? '').replace(/^[-*]\s+/, '')
}
