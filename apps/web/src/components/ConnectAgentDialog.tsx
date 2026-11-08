import { Bot, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { agentClients, type Snippet } from '../agents/agentClients.ts'

const CLIENT_SELECT_ID = 'agent-client'

type Props = {
  user: string
}

export function ConnectAgentDialog({ user }: Props) {
  const clients = agentClients(user)
  const [clientId, setClientId] = useState(clients[0]?.id)
  const client = clients.find((c) => c.id === clientId)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-10 min-w-10 sm:h-9">
          <Bot />
          <span className="max-sm:sr-only">Connect an agent</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-140">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Connect an agent</DialogTitle>
          <DialogDescription>
            An AI agent can search and create notes for {user}. Its notes are marked as written by an agent. Agents
            cannot delete notes.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor={CLIENT_SELECT_ID}>Your app</FieldLabel>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger id={CLIENT_SELECT_ID} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {client && (
          <section aria-label={`${client.name} setup`} className="grid min-w-0 gap-3">
            <p className="text-sm">{client.steps}</p>
            {client.snippets.map((snippet) => (
              <CopyableCode key={snippet.label} snippet={snippet} />
            ))}
          </section>
        )}

        <DialogFooter className="text-xs text-muted-foreground sm:justify-start">
          <p>
            Demo identity, not real auth: anyone with this header can act as you. ChatGPT needs a public HTTPS server
            with OAuth, so use Codex for OpenAI.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CopyStatus = 'idle' | 'copied' | 'failed'

function CopyableCode({ snippet }: { snippet: Snippet }) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setStatus('copied')
    } catch {
      // Clipboard access can be blocked; the text stays selectable, and the label says so.
      setStatus('failed')
    }
  }

  return (
    <figure className="min-w-0 overflow-hidden rounded-lg border bg-muted">
      <figcaption className="flex items-center justify-between gap-2 border-b py-1 pr-1 pl-3">
        <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{snippet.label}</span>
        <Button variant="ghost" size="sm" onClick={() => void copy()}>
          {status === 'copied' ? <Check /> : <Copy />}
          {status === 'copied' ? 'Copied' : status === 'failed' ? 'Select and copy' : 'Copy'}
        </Button>
      </figcaption>
      <pre className="max-h-80 overflow-auto px-3 py-2.5 font-mono text-xs leading-5 whitespace-pre-wrap wrap-break-word">
        <code>{snippet.code}</code>
      </pre>
    </figure>
  )
}
