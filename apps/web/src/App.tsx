import { NameEntry } from '@/components/NameEntry'
import { NotesPage } from '@/components/NotesPage'
import { useStoredUser } from '@/user/useStoredUser'

export function App() {
  const { user, signIn, switchUser } = useStoredUser()

  if (!user) return <NameEntry onSubmit={signIn} />
  return <NotesPage user={user} onSwitchUser={switchUser} />
}
