import type { Note } from '@team-notes/types'
import { ChevronLeft, NotebookText, Trash2 } from 'lucide-react'
import type { RefObject } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatFull, initials } from '../notes/format.ts'
import type { NoteList } from '../notes/useNotes.ts'
import { AgentBadge } from './AgentBadge.tsx'

type Props = {
  className: string
  status: NoteList['status']
  note: Note | null
  isEmpty: boolean
  onDelete: () => void
  onBack: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function NoteDetail({ className, status, note, isEmpty, onDelete, onBack, headingRef }: Props) {
  return (
    <main className={`overflow-auto ${className}`}>
      {status === 'loading' && <LoadingDetail />}
      {status !== 'loading' && !note && <Placeholder status={status} isEmpty={isEmpty} />}
      {note && (
        <article aria-labelledby={`note-${note.id}`} className="flex max-w-180 flex-col gap-4 px-4 pt-3 pb-10 md:px-12 md:pt-10 md:pb-16">
          <Button variant="ghost" className="-ml-2 self-start text-primary md:hidden dark:text-accent-foreground" onClick={onBack}>
            <ChevronLeft />
            All notes
          </Button>
          <div className="flex items-start justify-between gap-4">
            <h1
              id={`note-${note.id}`}
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-semibold tracking-tight outline-none"
            >
              {note.title}
            </h1>
            <Button variant="outline" className="flex-none text-destructive" onClick={onDelete}>
              <Trash2 />
              Delete
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            {note.source === 'agent' ? (
              <AgentBadge authorName={note.authorName} full />
            ) : (
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <Avatar className="size-5" aria-hidden="true">
                  <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
                    {initials(note.authorName)}
                  </AvatarFallback>
                </Avatar>
                {note.authorName}
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span>
              Created <time dateTime={note.createdAt}>{formatFull(note.createdAt)}</time>
            </span>
          </div>
          {note.tags.length > 0 && (
            <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
              {note.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline" className="bg-secondary font-normal text-muted-foreground">
                    {tag}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <hr className="my-1" />
          <div className="text-base leading-relaxed whitespace-pre-wrap">{note.body}</div>
        </article>
      )}
    </main>
  )
}

function Placeholder({ status, isEmpty }: { status: NoteList['status']; isEmpty: boolean }) {
  let title = 'Select a note to read it'
  let text = 'Use ↑ and ↓ to move through the list, then press Enter to open a note.'
  if (isEmpty) {
    title = 'Nothing to show yet'
    text = 'Create a note and it will open here.'
  }
  if (status === 'error') {
    title = 'Nothing to show'
    text = 'Notes will appear here once the list loads.'
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 p-8 text-center text-muted-foreground">
      <NotebookText className="size-5.5" aria-hidden="true" />
      <p className="mt-1.5 font-medium">{title}</p>
      <p className="max-w-75 text-sm">{text}</p>
    </div>
  )
}

function LoadingDetail() {
  return (
    <div aria-hidden="true" className="flex max-w-180 flex-col gap-3.5 px-4 pt-3 md:px-12 md:pt-10">
      <Skeleton className="h-5.5 w-1/2" />
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <hr className="my-1.5" />
      <Skeleton className="h-2.5 w-11/12" />
      <Skeleton className="h-2.5 w-5/6" />
      <Skeleton className="h-2.5 w-2/3" />
    </div>
  )
}
