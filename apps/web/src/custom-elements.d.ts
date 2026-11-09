import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { TagPicker } from '@team-notes/elements'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'tag-picker': DetailedHTMLProps<HTMLAttributes<TagPicker>, TagPicker> & {
        label?: string
        /** Comma-separated. */
        tags?: string
        'max-tags'?: number
        'max-tag-length'?: number
      }
    }
  }
}
