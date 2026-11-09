// Browsers keep ⌘N/Ctrl+N for "new window", so creating a note uses a plain N instead.
const IS_MAC = /Mac|iPhone|iPad/.test(navigator.userAgent)

export const MOD_KEY_LABEL = IS_MAC ? '⌘' : 'Ctrl'

export type Shortcut = { keys: string[]; description: string }

/** Shown in the help popover; the handlers live in useShortcuts. */
export const SHORTCUTS: Shortcut[] = [
  { keys: [MOD_KEY_LABEL, 'F'], description: 'Search notes' },
  { keys: ['N'], description: 'New note' },
]
