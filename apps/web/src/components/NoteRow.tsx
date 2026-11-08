import type { Note } from '@team-notes/types'
import { Badge } from '@/components/ui/badge'
import { formatRelative, snippet } from '../notes/format.ts'
import { AgentBadge } from './AgentBadge.tsx'

type Props = {
  note: Note
  selected: boolean
  tabIndex: number
  onOpen: () => void
}

export function NoteRow({ note, selected, tabIndex, onOpen }: Props) {
  return (
    <button
      type="button"
      data-row
      tabIndex={tabIndex}
      aria-current={selected}
      onClick={onOpen}
      className="flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 aria-[current=true]:bg-accent"
    >
      <span className="truncate font-semibold">{note.title}</span>
      <span className="truncate text-sm text-muted-foreground">{snippet(note.body)}</span>
      {note.tags.length > 0 && (
        <span className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="bg-secondary font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </span>
      )}
      <span className="flex items-center gap-1.5 overflow-hidden text-[13px] whitespace-nowrap text-muted-foreground">
        {note.source === 'agent' ? (
          <AgentBadge authorName={note.authorName} />
        ) : (
          <span className="truncate">{note.authorName}</span>
        )}
        <span aria-hidden="true">·</span>
        <span className="flex-none">{formatRelative(note.createdAt)}</span>
      </span>
    </button>
  )
}
