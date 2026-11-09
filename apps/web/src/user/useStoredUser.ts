import { useState } from 'react'

const USER_STORAGE_KEY = 'team-notes.user'

// Fake identity sent as X-User-Id. Not authentication.
export function useStoredUser() {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem(USER_STORAGE_KEY))

  function signIn(name: string) {
    localStorage.setItem(USER_STORAGE_KEY, name)
    setUser(name)
  }

  function switchUser() {
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }

  return { user, signIn, switchUser }
}
