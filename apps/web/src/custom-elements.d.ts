import type { DetailedHTMLProps, HTMLAttributes } from 'react'
import type { TagPicker } from '@team-notes/elements'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'tag-picker': DetailedHTMLProps<HTMLAttributes<TagPicker>, TagPicker>
    }
  }
}
