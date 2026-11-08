import type { CreateNoteInput } from '@team-notes/types'
import { CircleAlert } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import '@team-notes/elements'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (input: CreateNoteInput) => Promise<void>
}

export function CreateNoteDialog({ open, onClose, onCreate }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* The page moves focus to the new note itself, so stop Radix returning it to the opener. */}
      <DialogContent className="top-18 translate-y-0 sm:max-w-140" onCloseAutoFocus={(event) => event.preventDefault()}>
        <CreateNoteForm onCreate={onCreate} />
      </DialogContent>
    </Dialog>
  )
}

type SaveStatus = 'idle' | 'saving' | 'error'

// Mounted only while the dialog is open, so every open starts with an empty form.
function CreateNoteForm({ onCreate }: Pick<Props, 'onCreate'>) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [titleError, setTitleError] = useState(false)
  const [status, setStatus] = useState<SaveStatus>('idle')
  const titleRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const titleErrorId = `${id}-title-error`

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'saving') return
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError(true)
      titleRef.current?.focus()
      return
    }
    setStatus('saving')
    try {
      // shortcut: tags stay empty until the <tag-picker> element emits changes (t3).
      await onCreate({ title: trimmed, body, tags: [] })
    } catch {
      // The draft stays in the form; the alert below tells the user to retry.
      setStatus('error')
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">New note</DialogTitle>
        <DialogDescription className="sr-only">Give the note a title, then add text and tags.</DialogDescription>
      </DialogHeader>

      {status === 'error' && (
        <Alert variant="destructive" role="alert">
          <CircleAlert />
          <AlertDescription>
            <p>
              <strong className="font-semibold">Couldn’t save your note.</strong> Your text is still here. Check your
              connection and try again.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-title`}>
          Title <span className="font-normal text-muted-foreground">Required</span>
        </Label>
        <Input
          id={`${id}-title`}
          ref={titleRef}
          className="h-10"
          type="text"
          placeholder="What’s this note about?"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setTitleError(false)
          }}
          aria-required="true"
          aria-invalid={titleError}
          aria-describedby={titleError ? titleErrorId : undefined}
        />
        {titleError && (
          <p id={titleErrorId} className="text-sm text-destructive">
            Add a title to save this note.
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-body`}>Body</Label>
        <Textarea
          id={`${id}-body`}
          rows={6}
          placeholder="Write in plain text."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      <tag-picker></tag-picker>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">{status === 'saving' ? 'Saving…' : status === 'error' ? 'Try again' : 'Save note'}</Button>
      </DialogFooter>
    </form>
  )
}
