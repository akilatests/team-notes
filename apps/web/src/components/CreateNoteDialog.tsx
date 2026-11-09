import type { CreateNoteInput } from '@team-notes/types'
import { CircleAlert } from 'lucide-react'
import { TagsChangeEvent, type TagPicker } from '@team-notes/elements'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { INPUT_LIMITS } from '@/limits'
import { errorDetail } from '@/notes/apiError'
import { createNoteSchema } from '@/notes/createNoteSchema'

type Props = {
  open: boolean
  onClose: () => void
  onCreate: (input: CreateNoteInput) => Promise<void>
}

export function CreateNoteDialog({ open, onClose, onCreate }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* The page moves focus to the new note itself, so stop Radix returning it to the opener. */}
      <DialogContent className="top-4 max-h-[calc(100dvh-2rem)] translate-y-0 overflow-y-auto sm:top-18 sm:max-h-[calc(100dvh-6rem)] sm:max-w-140" onCloseAutoFocus={(event) => event.preventDefault()}>
        <CreateNoteForm onCreate={onCreate} />
      </DialogContent>
    </Dialog>
  )
}

// Mounted only while the dialog is open, so every open starts with an empty form.
function CreateNoteForm({ onCreate }: Pick<Props, 'onCreate'>) {
  const form = useForm({
    resolver: zodResolver(createNoteSchema),
    defaultValues: { title: '', body: '', tags: [] },
  })
  const { errors, isSubmitting, isSubmitted } = form.formState
  const tags = useWatch({ control: form.control, name: 'tags' })
  const tagPickerRef = useRef<TagPicker>(null)
  const id = useId()
  const titleErrorId = `${id}-title-error`

  useEffect(() => {
    const picker = tagPickerRef.current
    if (!picker) return
    function handleTagsChange(event: Event) {
      if (event instanceof TagsChangeEvent) form.setValue('tags', event.tags, { shouldValidate: isSubmitted })
    }
    picker.addEventListener(TagsChangeEvent.type, handleTagsChange)
    return () => picker.removeEventListener(TagsChangeEvent.type, handleTagsChange)
  }, [form, isSubmitted])

  async function save(input: CreateNoteInput) {
    try {
      await onCreate(input)
    } catch (error) {
      // The draft stays in the form; the alert below says why and the user can retry.
      form.setError('root', { message: errorDetail(error) })
    }
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        // A second Enter while saving must not create the note twice.
        if (isSubmitting) {
          event.preventDefault()
          return
        }
        void form.handleSubmit(save)(event)
      }}
      noValidate
    >
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold">New note</DialogTitle>
        <DialogDescription className="sr-only">Give the note a title, then add text and tags.</DialogDescription>
      </DialogHeader>

      {errors.root && (
        <Alert variant="destructive" role="alert">
          <CircleAlert />
          <AlertDescription>
            <p>
              <strong className="font-semibold">Couldn’t save your note.</strong> Your text is still here. {errors.root.message}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <Field data-invalid={errors.title !== undefined}>
        <FieldLabel htmlFor={`${id}-title`}>
          Title <span className="font-normal text-muted-foreground">Required</span>
        </FieldLabel>
        <Input
          id={`${id}-title`}
          className="h-10"
          type="text"
          placeholder="What’s this note about?"
          maxLength={INPUT_LIMITS.title}
          aria-required="true"
          aria-invalid={errors.title !== undefined}
          aria-describedby={errors.title ? titleErrorId : undefined}
          {...form.register('title')}
        />
        <FieldError id={titleErrorId} errors={[errors.title]} />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${id}-body`}>Body</FieldLabel>
        <Textarea
          id={`${id}-body`}
          rows={6}
          placeholder="Write in plain text."
          maxLength={INPUT_LIMITS.body}
          {...form.register('body')}
        />
      </Field>

      <Field data-invalid={errors.tags !== undefined}>
        <tag-picker
          ref={tagPickerRef}
          label="Tags"
          tags={tags.join(',')}
          max-tags={INPUT_LIMITS.tagsMaxCount}
          max-tag-length={INPUT_LIMITS.tagMaxLength}
        ></tag-picker>
        <FieldError errors={[errors.tags]} />
      </Field>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit">{isSubmitting ? 'Saving…' : errors.root ? 'Try again' : 'Save note'}</Button>
      </DialogFooter>
    </form>
  )
}
