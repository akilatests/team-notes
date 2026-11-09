import { NotebookText } from 'lucide-react'
import { ConnectAgentDialog } from '@/components/ConnectAgentDialog'
import { ModeToggle } from '@/components/ModeToggle'
import { UserMenu } from '@/components/UserMenu'

type Props = {
  user: string
  onSwitchUser: () => void
}

export function Header({ user, onSwitchUser }: Props) {
  return (
    <header className="flex h-14 flex-none items-center gap-2 border-b px-3 sm:px-6">
      <span className="mr-auto flex min-w-0 items-center gap-2 font-semibold tracking-tight">
        <NotebookText className="size-5 flex-none text-primary dark:text-accent-foreground" aria-hidden="true" />
        <span className="truncate">Team Notes</span>
      </span>
      <div className="flex flex-none items-center gap-1">
        <ConnectAgentDialog user={user} />
        <ModeToggle />
        <UserMenu user={user} onSwitchUser={onSwitchUser} />
      </div>
    </header>
  )
}
