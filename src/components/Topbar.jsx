import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme'

export function Topbar({ title = 'Dashboard' }) {
  const { theme, toggleTheme } = useTheme()
  const heading = title.toUpperCase()

  return (
    <header className="sticky top-0 z-40 flex min-h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 px-3 pt-[max(0.25rem,env(safe-area-inset-top))] pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:border-0 sm:px-4 sm:pb-3 sm:pt-[max(0rem,env(safe-area-inset-top))]">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-4">
        <h1 className="truncate font-mono text-base font-semibold tracking-tight text-foreground sm:text-3xl">
          {heading} //
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 shrink-0 sm:h-9 sm:w-9 mt-3"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  )
}
