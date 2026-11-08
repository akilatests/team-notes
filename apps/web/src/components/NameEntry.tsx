import { CircleAlert, Info } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  onSubmit: (name: string) => void
}

export function NameEntry({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [showError, setShowError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  const helpId = `${id}-help`
  const errorId = `${id}-error`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setShowError(true)
      inputRef.current?.focus()
      return
    }
    onSubmit(trimmed)
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-sidebar p-6">
      <Card className="w-full max-w-100">
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold tracking-tight">Team Notes</span>
              <Badge variant="outline" className="text-muted-foreground">
                <Info />
                Demo identity
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={id} className="text-2xl font-semibold tracking-tight">
                What’s your name?
              </Label>
              <p id={helpId} className="text-muted-foreground">
                This isn’t a real sign-in. There’s no password — your name is only shown on the notes you create.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Input
                id={id}
                ref={inputRef}
                className="h-11 text-base"
                type="text"
                autoComplete="name"
                autoFocus
                placeholder="e.g. Maya Okafor"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  setShowError(false)
                }}
                aria-invalid={showError}
                aria-describedby={showError ? `${errorId} ${helpId}` : helpId}
              />
              {showError && (
                <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
                  <CircleAlert className="size-4" aria-hidden="true" />
                  Enter your name to continue.
                </p>
              )}
            </div>

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
