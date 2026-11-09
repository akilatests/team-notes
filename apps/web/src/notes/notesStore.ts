import type { CreateNoteInput, Note } from '@team-notes/types'
import { create } from 'zustand'
import { isNotFound } from '@/notes/apiError'
import * as notesApi from '@/notes/notesApi'

export type NoteList =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; notes: Note[] }

type NotesState = {
  list: NoteList
  /** The user and query of the last load, reused by reload() and the mutations. */
  userName: string
  query: string
  load: (userName: string, query: string) => Promise<void>
  reload: () => Promise<void>
  createNote: (input: CreateNoteInput) => Promise<Note>
  deleteNote: (id: number) => Promise<void>
}

// Not state: only used to drop responses from a query the user has already typed past.
let latestRequest = 0

export const useNotesStore = create<NotesState>()((set, get) => ({
  list: { status: 'loading' },
  userName: '',
  query: '',

  async load(userName, query) {
    set({ userName, query })
    const request = ++latestRequest
    try {
      const notes = await notesApi.listNotes(userName, query)
      if (request === latestRequest) set({ list: { status: 'ready', notes } })
    } catch {
      if (request === latestRequest) set({ list: { status: 'error' } })
    }
  },

  async reload() {
    set({ list: { status: 'loading' } })
    const { userName, query } = get()
    await get().load(userName, query)
  },

  async createNote(input) {
    const note = await notesApi.createNote(get().userName, input)
    const { list } = get()
    if (list.status === 'ready') {
      set({ list: { status: 'ready', notes: [note, ...list.notes] } })
    } else {
      void get().reload()
    }
    return note
  },

  async deleteNote(id) {
    try {
      await notesApi.deleteNote(get().userName, id)
    } catch (error) {
      // Someone else already deleted it: the outcome the user wanted, so not an error.
      if (!isNotFound(error)) throw error
    }
    const { list } = get()
    if (list.status === 'ready') {
      set({ list: { status: 'ready', notes: list.notes.filter((note) => note.id !== id) } })
    }
  },
}))
