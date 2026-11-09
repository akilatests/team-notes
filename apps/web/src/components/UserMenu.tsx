import { ChevronDown, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { initials } from '@/notes/format'

type Props = {
  user: string
  onSwitchUser: () => void
}

export function UserMenu({ user, onSwitchUser }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-1.5 sm:h-9 sm:pr-2.5" aria-label={`Account: ${user}`}>
          <Avatar className="size-7" aria-hidden="true">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials(user)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-40 truncate max-sm:hidden">{user}</span>
          <ChevronDown className="text-muted-foreground max-sm:hidden" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSwitchUser}>
          <LogOut />
          Switch user
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
