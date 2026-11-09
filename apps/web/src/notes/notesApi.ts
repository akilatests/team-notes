import type { CreateNoteInput, Note } from '@team-notes/types'
import axios, { isAxiosError } from 'axios'
import { ApiError } from '@/notes/apiError'

const USER_HEADER = 'X-User-Id'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError<{ error?: { message?: unknown } }>(error)) {
    const message = error.response?.data?.error?.message
    // Only our API sends { error }; anything else (e.g. the dev proxy with the API down) means it was not reached.
    if (typeof message !== 'string') return Promise.reject(new ApiError(error.message, undefined))
    return Promise.reject(new ApiError(message, error.response?.status))
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
