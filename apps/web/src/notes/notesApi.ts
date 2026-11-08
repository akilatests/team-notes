import type { CreateNoteInput, Note } from '@team-notes/types'
import { FAKE_NOTES } from './fakeNotes.ts'

// shortcut: in-memory fake for t2. t5 swaps these bodies for fetch calls; the signatures stay.
const FAKE_LATENCY_MS = 500
const FAIL_PARAM = 'fail'

type FakeFailure = 'list' | 'save' | 'delete'

let notes = [...FAKE_NOTES]
let nextId = notes.length + 1

// Preview the error states with ?fail=list, ?fail=save or ?fail=delete.
function shouldFail(action: FakeFailure): boolean {
  return new URLSearchParams(window.location.search).getAll(FAIL_PARAM).includes(action)
}

function respond<T>(action: FakeFailure, result: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail(action)) reject(new Error(`Fake ${action} failure`))
      else resolve(result())
    }, FAKE_LATENCY_MS)
  })
}

function matches(note: Note, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    note.title.toLowerCase().includes(q) ||
    note.body.toLowerCase().includes(q) ||
    note.tags.some((tag) => tag.toLowerCase().includes(q))
  )
}

export function listNotes(query: string): Promise<Note[]> {
  return respond('list', () => notes.filter((note) => matches(note, query)))
}

export function createNote(userName: string, input: CreateNoteInput): Promise<Note> {
  return respond('save', () => {
    const note: Note = {
      ...input,
      id: nextId++,
      authorName: userName,
      source: 'human',
      createdAt: new Date().toISOString(),
    }
    notes = [note, ...notes]
    return note
  })
}

export function deleteNote(id: number): Promise<void> {
  return respond('delete', () => {
    notes = notes.filter((note) => note.id !== id)
  })
}
