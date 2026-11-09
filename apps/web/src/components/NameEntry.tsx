import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { INPUT_LIMITS } from '@/limits'
import { nameSchema } from '@/user/nameSchema'
import { ModeToggle } from '@/components/ModeToggle'

type Props = {
  onSubmit: (name: string) => void
}

export function NameEntry({ onSubmit }: Props) {
  const form = useForm({ resolver: zodResolver(nameSchema), defaultValues: { name: '' } })
  const error = form.formState.errors.name
  const id = useId()
  const helpId = `${id}-help`
  const errorId = `${id}-error`

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-sidebar px-4 py-16 sm:p-6">
      <div className="absolute top-3 right-3">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-100">
        <CardContent>
          <form
            className="flex flex-col gap-6"
            onSubmit={(event) => void form.handleSubmit(({ name }) => onSubmit(name))(event)}
            noValidate
          >
            <span className="font-semibold tracking-tight">Team Notes</span>

            <Field data-invalid={error !== undefined}>
              <FieldLabel htmlFor={id} className="text-2xl font-semibold tracking-tight">
                What’s your name?
              </FieldLabel>
              <FieldDescription id={helpId}>
                Your name is shown on the notes you create.
              </FieldDescription>
              <Input
                id={id}
                className="h-11 text-base"
                type="text"
                autoComplete="name"
                maxLength={INPUT_LIMITS.userName}
                autoFocus
                placeholder="e.g. Maya Okafor"
                aria-invalid={error !== undefined}
                aria-describedby={error ? `${errorId} ${helpId}` : helpId}
                {...form.register('name')}
              />
              <FieldError id={errorId} errors={[error]} />
            </Field>

            <Button type="submit" size="lg" className="h-11">
              Continue
            </Button>
            <p className="text-sm text-muted-foreground">
              You can switch to a different name at any time from the header.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
