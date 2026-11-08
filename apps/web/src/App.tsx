import { NameEntry } from './components/NameEntry.tsx'
import { NotesPage } from './components/NotesPage.tsx'
import { useStoredUser } from './user/useStoredUser.ts'

export function App() {
  const { user, signIn, switchUser } = useStoredUser()

  if (!user) return <NameEntry onSubmit={signIn} />
  return <NotesPage user={user} onSwitchUser={switchUser} />
}
