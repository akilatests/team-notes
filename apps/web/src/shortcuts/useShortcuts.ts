import { useEffect } from 'react'

type Handlers = {
  /** False while a dialog is open, so N or ? cannot open something on top of it. */
  enabled: boolean
  onSearch: () => void
  onNewNote: () => void
  onHelp: () => void
}

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/** True when the key press lands in a text field, including the <tag-picker> input inside its shadow root. */
function isTyping(event: KeyboardEvent): boolean {
  const target = event.composedPath()[0]
  return target instanceof HTMLElement && (target.isContentEditable || TYPING_TAGS.has(target.tagName))
}

/** App-wide keyboard shortcuts, the same keydown pattern shadcn uses for its ⌘K command menu. */
export function useShortcuts({ enabled, onSearch, onNewNote, onHelp }: Handlers) {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(event: KeyboardEvent) {
      const mod = event.metaKey || event.ctrlKey
      if (mod && !event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        onSearch()
        return
      }
      if (mod || event.altKey || isTyping(event)) return
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        onNewNote()
      } else if (event.key === '?') {
        event.preventDefault()
        onHelp()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled, onSearch, onNewNote, onHelp])
}
