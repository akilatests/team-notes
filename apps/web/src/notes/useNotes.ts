import type { CreateNoteInput, Note } from '@team-notes/types'
import { useCallback, useEffect, useState } from 'react'
import * as notesApi from './notesApi.ts'

export type NoteList =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; notes: Note[] }

export function useNotes(userName: string, query: string) {
  const [list, setList] = useState<NoteList>({ status: 'loading' })
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    // Ignore responses from a query the user has already typed past.
    let stale = false
    notesApi.listNotes(query).then(
      (notes) => {
        if (!stale) setList({ status: 'ready', notes })
      },
      () => {
        if (!stale) setList({ status: 'error' })
      },
    )
    return () => {
      stale = true
    }
  }, [query, reloadCount])

  const reload = useCallback(() => {
    setList({ status: 'loading' })
    setReloadCount((count) => count + 1)
  }, [])

  const createNote = useCallback(
    async (input: CreateNoteInput): Promise<Note> => {
      const note = await notesApi.createNote(userName, input)
      setList((prev) => (prev.status === 'ready' ? { status: 'ready', notes: [note, ...prev.notes] } : prev))
      return note
    },
    [userName],
  )

  const deleteNote = useCallback(async (id: number): Promise<void> => {
    await notesApi.deleteNote(id)
    setList((prev) =>
      prev.status === 'ready' ? { status: 'ready', notes: prev.notes.filter((note) => note.id !== id) } : prev,
    )
  }, [])

  return { list, reload, createNote, deleteNote }
}
