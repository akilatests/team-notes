import { Bot } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Props = {
  authorName: string
}

export function AgentBadge({ authorName }: Props) {
  return (
    <Badge
      variant="secondary"
      className="h-4.5 gap-1 px-1.5 text-[11px] font-medium text-muted-foreground"
      title={`Created by an AI agent on behalf of ${authorName}`}
    >
      <Bot aria-hidden="true" />
      Agent
    </Badge>
  )
}
