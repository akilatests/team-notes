import { Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { firstName } from '../notes/format.ts'

type Props = {
  authorName: string
  /** Long form for the detail view: "Created by agent for Priya Raman". */
  full?: boolean
}

export function AgentBadge({ authorName, full = false }: Props) {
  return (
    <Badge variant="outline" className="border-primary/25 bg-accent text-accent-foreground">
      <Sparkles aria-hidden="true" />
      {full ? `Created by agent for ${authorName}` : `Agent for ${firstName(authorName)}`}
    </Badge>
  )
}
