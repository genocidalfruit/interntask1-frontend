import { Toaster as Sonner } from 'sonner'
import { useTheme } from '@/lib/theme'
import { useMaxWidth } from '@/lib/useMediaQuery'

export function Toaster() {
  const { theme } = useTheme()
  const narrow = useMaxWidth(639)
  return (
    <Sonner
      theme={theme}
      richColors
      position={narrow ? 'top-center' : 'top-right'}
      offset={narrow ? 'max(1rem, env(safe-area-inset-top))' : '1rem'}
      duration={2000}
      toastOptions={{ className: 'touch-manipulation' }}
    />
  )
}
