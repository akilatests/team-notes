import { useCallback, useEffect, useState } from 'react'

const NOTE_PATH = /^\/notes\/(\d+)$/
const HOME_PATH = '/'

function noteIdFromUrl(): number | null {
  const match = NOTE_PATH.exec(window.location.pathname)
  return match ? Number(match[1]) : null
}

function urlFor(id: number | null): string {
  return id === null ? HOME_PATH : `/notes/${id}`
}

export function useSelectedNoteId() {
  const [selectedId, setSelectedId] = useState(noteIdFromUrl)

  useEffect(() => {
    const onPopState = () => setSelectedId(noteIdFromUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const selectNote = useCallback(
    (id: number | null, { replace = false } = {}) => {
      if (id === selectedId) return
      const url = urlFor(id)
      if (replace) window.history.replaceState(null, '', url)
      else window.history.pushState(null, '', url)
      setSelectedId(id)
    },
    [selectedId],
  )

  return { selectedId, selectNote }
}
