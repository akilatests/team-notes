import { NotebookText } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { initials } from '../notes/format.ts'
import { ModeToggle } from './ModeToggle.tsx'

type Props = {
  user: string
  onSwitchUser: () => void
}

export function Header({ user, onSwitchUser }: Props) {
  return (
    <header className="flex h-14 flex-none items-center justify-between gap-3 border-b px-4 sm:px-6">
      <span className="flex items-center gap-2 font-semibold tracking-tight whitespace-nowrap">
        <NotebookText className="size-4.5 text-primary dark:text-accent-foreground" aria-hidden="true" />
        Team Notes
      </span>
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar className="size-7" aria-hidden="true">
          <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
            {initials(user)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 truncate text-sm font-medium">{user}</span>
        <span aria-hidden="true" className="h-4 w-px flex-none bg-border" />
        <ModeToggle />
        <Button variant="ghost" size="sm" className="text-primary dark:text-accent-foreground" onClick={onSwitchUser}>
          Switch user
        </Button>
      </div>
    </header>
  )
}
