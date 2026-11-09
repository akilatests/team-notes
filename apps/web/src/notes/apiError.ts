import { HttpStatusCode } from 'axios'

/** A failed API call. `status` is missing when no response arrived (offline, API down). */
export class ApiError extends Error {
  readonly status: number | undefined

  constructor(message: string, status: number | undefined) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** A sentence for the UI explaining why a request failed. */
export function errorDetail(error: unknown): string {
  if (!(error instanceof ApiError) || error.status === undefined) return 'Check your connection and try again.'
  if (error.status >= HttpStatusCode.InternalServerError) return 'The server had a problem. Try again in a moment.'
  return error.message
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === HttpStatusCode.NotFound
}
