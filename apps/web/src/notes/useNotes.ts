import { useEffect } from 'react'
import { useNotesStore } from '@/notes/notesStore'

export type { NoteList } from '@/notes/notesStore'

const SEARCH_DELAY_MS = 250

export function useNotes(userName: string, query: string) {
  const { list, load, reload, createNote, deleteNote } = useNotesStore()

  useEffect(() => {
    const timer = setTimeout(() => void load(userName, query), query ? SEARCH_DELAY_MS : 0)
    return () => clearTimeout(timer)
  }, [userName, query, load])

  return { list, reload, createNote, deleteNote }
}
