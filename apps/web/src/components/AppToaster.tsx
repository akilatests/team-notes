import { Toaster } from '@/components/ui/sonner'
import { useTheme } from '@/theme/theme'

// shadcn's Toaster reads next-themes; passing our theme keeps toasts in step with the app's toggle.
export function AppToaster() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="bottom-right" />
}
