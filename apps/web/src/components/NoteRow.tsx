import type { Note } from '@team-notes/types'
import { Badge } from '@/components/ui/badge'
import { AgentBadge } from '@/components/AgentBadge'
import { formatRelative, snippet } from '@/notes/format'

const ROW_TAG_LIMIT = 3

type Props = {
  note: Note
  selected: boolean
  tabIndex: number
  onOpen: () => void
}

// Every line has a fixed height and never wraps, so all rows are the same height.
export function NoteRow({ note, selected, tabIndex, onOpen }: Props) {
  const preview = snippet(note.body)
  const shownTags = note.tags.slice(0, ROW_TAG_LIMIT)
  const hiddenTagCount = note.tags.length - shownTags.length

  return (
    <button
      type="button"
      data-row
      tabIndex={tabIndex}
      aria-current={selected}
      onClick={onOpen}
      className="grid w-full gap-1 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 aria-[current=true]:bg-accent"
    >
      <span className="truncate leading-5 font-semibold">{note.title}</span>
      <span className="h-5 truncate text-sm leading-5 text-muted-foreground">{preview || 'No text'}</span>
      <span className="flex h-5 items-center gap-1">
        {shownTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            title={tag}
            className="h-4.5 max-w-18 bg-secondary px-1.5 text-[11px] font-normal text-muted-foreground"
          >
            <span className="truncate">{tag}</span>
          </Badge>
        ))}
        {hiddenTagCount > 0 && (
          <Badge variant="outline" className="h-4.5 px-1.5 text-[11px] font-normal text-muted-foreground">
            +{hiddenTagCount}
            <span className="sr-only"> more {hiddenTagCount === 1 ? 'tag' : 'tags'}</span>
          </Badge>
        )}
      </span>
      <span className="flex h-5 items-center gap-1.5 text-[13px] whitespace-nowrap text-muted-foreground">
        <span className="min-w-0 truncate">{note.authorName}</span>
        {note.source === 'agent' && <AgentBadge authorName={note.authorName} />}
        <span aria-hidden="true">·</span>
        <span className="flex-none">{formatRelative(note.createdAt)}</span>
      </span>
    </button>
  )
}
