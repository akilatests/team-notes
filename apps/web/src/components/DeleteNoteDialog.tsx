import { CircleAlert } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { errorDetail } from '@/notes/apiError'

type Props = {
  open: boolean
  noteTitle: string
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteNoteDialog({ open, noteTitle, onClose, onConfirm }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* The page moves focus to search after a delete, so stop Radix returning it to the opener. */}
      <AlertDialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto" onCloseAutoFocus={(event) => event.preventDefault()}>
        <DeleteConfirm noteTitle={noteTitle} onConfirm={onConfirm} />
      </AlertDialogContent>
    </AlertDialog>
  )
}

type DeleteStatus = 'idle' | 'deleting' | { error: string }

function DeleteConfirm({ noteTitle, onConfirm }: Pick<Props, 'noteTitle' | 'onConfirm'>) {
  const [status, setStatus] = useState<DeleteStatus>('idle')

  async function handleConfirm() {
    if (status === 'deleting') return
    setStatus('deleting')
    try {
      await onConfirm()
    } catch (error) {
      // The note is kept; the alert below says why and the user can retry.
      setStatus({ error: errorDetail(error) })
    }
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg font-semibold">Delete this note?</AlertDialogTitle>
        <AlertDialogDescription>
          “{noteTitle}” will be removed for everyone on the team. This can’t be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {typeof status === 'object' && (
        <Alert variant="destructive" role="alert">
          <CircleAlert />
          <AlertDescription>
            <p>
              <strong className="font-semibold">Couldn’t delete the note.</strong> It’s still there. {status.error}
            </p>
          </AlertDescription>
        </Alert>
      )}

      <AlertDialogFooter>
        {/* Radix focuses Cancel first, the safe choice. */}
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        {/* A plain Button, not AlertDialogAction: that closes at once and would hide a failed delete. */}
        <Button variant="destructive" onClick={handleConfirm}>
          {status === 'deleting' ? 'Deleting…' : typeof status === 'object' ? 'Try again' : 'Delete note'}
        </Button>
      </AlertDialogFooter>
    </>
  )
}
