import type { CreateNoteInput } from '@team-notes/types'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { toast } from 'sonner'
import { useNotes } from '@/notes/useNotes'
import { useSelectedNoteId } from '@/notes/useSelectedNoteId'
import { CreateNoteDialog } from '@/components/CreateNoteDialog'
import { DeleteNoteDialog } from '@/components/DeleteNoteDialog'
import { Header } from '@/components/Header'
import { NoteDetail } from '@/components/NoteDetail'
import { NoteList } from '@/components/NoteList'

// Tailwind's md breakpoint: below it, list and detail are separate views.
const MOBILE_QUERY = '(max-width: 767px)'

type OpenDialog = 'create' | 'delete' | null

type Props = {
  user: string
  onSwitchUser: () => void
}

export function NotesPage({ user, onSwitchUser }: Props) {
  const [query, setQuery] = useState('')
  const { list, reload, createNote, deleteNote } = useNotes(user, query)
  const { selectedId, selectNote } = useSelectedNoteId()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const selected = list.status === 'ready' ? (list.notes.find((note) => note.id === selectedId) ?? null) : null
  const isEmpty = list.status === 'ready' && list.notes.length === 0 && query === ''
  // An unfiltered list without the note means the URL points at a deleted or unknown note.
  const isMissing = list.status === 'ready' && selectedId !== null && !selected && query === ''
  // On phones a selected note replaces the list; Back (or 'All notes') returns to it.
  const mobileView = selectedId === null ? 'list' : 'detail'

  // flushSync renders the new state now, so the element we focus next exists.
  function showNote(id: number) {
    flushSync(() => selectNote(id))
  }

  function handleOpen(id: number) {
    showNote(id)
    // On phones the list disappears, so move focus to the note instead of losing it.
    if (window.matchMedia(MOBILE_QUERY).matches) headingRef.current?.focus()
  }

  async function handleCreate(input: CreateNoteInput) {
    const note = await createNote(input)
    flushSync(() => {
      setDialog(null)
      setQuery('')
    })
    showNote(note.id)
    headingRef.current?.focus()
    toast.success('Note created')
  }

  async function handleDelete() {
    if (!selected) return
    await deleteNote(selected.id)
    flushSync(() => {
      setDialog(null)
      selectNote(null, { replace: true })
    })
    searchRef.current?.focus()
    toast.success('Note deleted')
  }

  return (
    <div className="flex h-dvh flex-col">
      <Header user={user} onSwitchUser={onSwitchUser} />
      <div className="group flex min-h-0 flex-1" data-view={mobileView}>
        <NoteList
          className="min-w-0 flex-1 max-md:group-data-[view=detail]:hidden md:flex-[0_0_20rem] md:border-r lg:flex-[0_0_22.5rem] xl:flex-[0_0_25rem]"
          list={list}
          query={query}
          onQueryChange={setQuery}
          selectedId={selectedId}
          onOpen={handleOpen}
          onNewNote={() => setDialog('create')}
          onRetry={() => void reload()}
          searchRef={searchRef}
        />
        <NoteDetail
          className="min-w-0 flex-1 max-md:group-data-[view=list]:hidden"
          status={list.status}
          note={selected}
          isEmpty={isEmpty}
          onDelete={() => setDialog('delete')}
          isMissing={isMissing}
          onBack={() => selectNote(null)}
          headingRef={headingRef}
        />
      </div>

      <CreateNoteDialog open={dialog === 'create'} onClose={() => setDialog(null)} onCreate={handleCreate} />
      <DeleteNoteDialog
        open={dialog === 'delete' && selected !== null}
        noteTitle={selected?.title ?? ''}
        onClose={() => setDialog(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
