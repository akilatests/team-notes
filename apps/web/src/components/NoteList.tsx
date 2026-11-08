import type { Note } from '@team-notes/types'
import { CircleAlert, NotebookText, Plus, RotateCw, Search, X } from 'lucide-react'
import { useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { INPUT_LIMITS } from '../limits.ts'
import type { NoteList as NoteListState } from '../notes/useNotes.ts'
import { NoteRow } from './NoteRow.tsx'

const SKELETON_ROWS = 6
const ROW_SELECTOR = 'button[data-row]'

type Props = {
  className: string
  list: NoteListState
  query: string
  onQueryChange: (query: string) => void
  selectedId: number | null
  onOpen: (id: number) => void
  onNewNote: () => void
  onRetry: () => void
  searchRef: RefObject<HTMLInputElement | null>
}

export function NoteList({
  className,
  list,
  query,
  onQueryChange,
  selectedId,
  onOpen,
  onNewNote,
  onRetry,
  searchRef,
}: Props) {
  const [focusIndex, setFocusIndex] = useState(0)
  const tabStop = list.status === 'ready' ? rowTabIndex(list.notes, selectedId, focusIndex) : 0

  function clearQuery() {
    onQueryChange('')
    searchRef.current?.focus()
  }

  // One tab stop for the whole list (roving tabindex); arrows, Home and End move between rows.
  function handleRowKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const rows = [...event.currentTarget.querySelectorAll<HTMLElement>(ROW_SELECTOR)]
    const last = rows.length - 1
    const current = event.target instanceof HTMLElement ? Math.max(0, rows.indexOf(event.target)) : 0
    const next: Record<string, number> = {
      ArrowDown: Math.min(last, current + 1),
      ArrowUp: Math.max(0, current - 1),
      Home: 0,
      End: last,
    }
    const target = next[event.key]
    if (target === undefined) return
    event.preventDefault()
    setFocusIndex(target)
    rows[target]?.focus()
  }

  return (
    <nav aria-label="Notes" className={`flex flex-col bg-sidebar ${className}`}>
      <div className="flex flex-none gap-2 p-4 pb-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={searchRef}
            type="search"
            className="h-9 rounded-full px-9 [&::-webkit-search-cancel-button]:hidden"
            aria-label="Search notes by title, text or tag"
            placeholder="Search notes"
            maxLength={INPUT_LIMITS.query}
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value)
              setFocusIndex(0)
            }}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full text-muted-foreground"
              aria-label="Clear search"
              onClick={clearQuery}
            >
              <X />
            </Button>
          )}
        </div>
        <Button size="lg" onClick={onNewNote}>
          <Plus />
          New note
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-2 pb-4">
        {list.status === 'loading' && <LoadingRows />}

        {list.status === 'error' && (
          <Message
            role="alert"
            icon={<CircleAlert />}
            danger
            title="Couldn’t load notes"
            text="Check your connection and try again."
            action={
              <Button variant="outline" onClick={onRetry}>
                <RotateCw />
                Retry
              </Button>
            }
          />
        )}

        {list.status === 'ready' && list.notes.length === 0 && !query && (
          <Message
            icon={<NotebookText />}
            title="No notes yet"
            text="Notes your team writes, and notes agents create through the API, will show up here."
            action={
              <Button variant="outline" onClick={onNewNote}>
                <Plus />
                Create the first note
              </Button>
            }
          />
        )}

        {list.status === 'ready' && list.notes.length === 0 && query && (
          <Message
            role="status"
            icon={<Search />}
            title={`No notes match “${query}”`}
            text="Search looks at titles, note text and tags."
            action={
              <Button variant="outline" onClick={clearQuery}>
                Clear search
              </Button>
            }
          />
        )}

        {list.status === 'ready' && list.notes.length > 0 && (
          <>
            <p className="px-3 pt-1 pb-2 text-xs text-muted-foreground">
              {query ? `${countLabel(list.notes.length)} found` : `Newest first · ${countLabel(list.notes.length)}`}
            </p>
            <ul className="flex flex-col gap-0.5" aria-label="Notes, newest first" onKeyDown={handleRowKeyDown}>
              {list.notes.map((note, index) => (
                <li key={note.id}>
                  <NoteRow
                    note={note}
                    selected={note.id === selectedId}
                    tabIndex={index === tabStop ? 0 : -1}
                    onOpen={() => {
                      setFocusIndex(index)
                      onOpen(note.id)
                    }}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </nav>
  )
}

type MessageProps = {
  role?: 'alert' | 'status'
  icon: ReactNode
  danger?: boolean
  title: string
  text: string
  action: ReactNode
}

function Message({ role, icon, danger = false, title, text, action }: MessageProps) {
  return (
    <Empty role={role} className="px-6 py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon" className={danger ? 'bg-destructive/10 text-destructive' : undefined}>
          {icon}
        </EmptyMedia>
        <EmptyTitle className="wrap-anywhere">{title}</EmptyTitle>
        <EmptyDescription>{text}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{action}</EmptyContent>
    </Empty>
  )
}

// The selected row keeps the tab stop; otherwise the last row reached with the keyboard.
function rowTabIndex(notes: Note[], selectedId: number | null, focusIndex: number): number {
  const selectedIndex = notes.findIndex((note) => note.id === selectedId)
  return selectedIndex >= 0 ? selectedIndex : Math.min(focusIndex, notes.length - 1)
}

function countLabel(count: number): string {
  return `${count} ${count === 1 ? 'note' : 'notes'}`
}

function LoadingRows() {
  return (
    <div aria-busy="true" className="flex flex-col gap-0.5">
      <span className="sr-only">Loading notes</span>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} aria-hidden="true" className="flex flex-col gap-2 p-3">
          <Skeleton className="h-3 w-3/5" />
          <Skeleton className="h-2.5 w-4/5" />
          <div className="flex gap-1.5">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
