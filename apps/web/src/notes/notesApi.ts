import type { CreateNoteInput, Note } from '@team-notes/types'
import axios, { isAxiosError } from 'axios'

const USER_HEADER = 'X-User-Id'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message
    return Promise.reject(new Error(typeof message === 'string' ? message : error.message))
  }
  return Promise.reject(error)
})

function userHeaders(userName: string) {
  return { [USER_HEADER]: encodeURIComponent(userName) }
}

export async function listNotes(userName: string, query: string): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes', { params: { q: query }, headers: userHeaders(userName) })
  return data
}

export async function createNote(userName: string, input: CreateNoteInput): Promise<Note> {
  const { data } = await api.post<Note>('/notes', input, { headers: userHeaders(userName) })
  return data
}

export async function deleteNote(userName: string, id: number): Promise<void> {
  await api.delete(`/notes/${id}`, { headers: userHeaders(userName) })
}
