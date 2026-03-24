import { Card, CardContent } from '@/components/ui/card'
import type { FeedingLog } from '@/types'

interface FeedingListProps {
  feedings: FeedingLog[]
}

function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }
  if (diffDays === 1) {
    const time = new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
    return `Yesterday at ${time}`
  }
  if (diffDays < 7) {
    const day = new Date(dateString).toLocaleDateString([], { weekday: 'long' })
    const time = new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
    return `${day} at ${time}`
  }
  return new Date(dateString).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function FeedingList({ feedings }: FeedingListProps) {
  if (feedings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No feedings logged yet. Add one above!
      </div>
    )
  }

  const sorted = [...feedings].sort(
    (a, b) => new Date(b.fed_at).getTime() - new Date(a.fed_at).getTime()
  )

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((feeding) => (
        <Card key={feeding.id}>
          <CardContent className="flex flex-col gap-1 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-sm">
                {feeding.food_type ?? 'Unspecified food'}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatRelativeTime(feeding.fed_at)}
              </span>
            </div>
            {feeding.notes && (
              <p className="text-sm text-muted-foreground">{feeding.notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
