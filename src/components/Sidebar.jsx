import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'border-l-2 border-primary bg-primary/10 text-primary'
      : 'border-l-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  )

function NavLinks({ onNavigate }) {
  const handleClick = () => onNavigate?.()
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      <NavLink to="/" className={navClass} end onClick={handleClick}>
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        Dashboard
      </NavLink>
    </nav>
  )
}

function ThemeToggleBlock() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="p-3">
      <Separator className="mb-3" />
      <Button variant="outline" className="w-full justify-start gap-2" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </Button>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="font-mono text-lg font-bold tracking-tight text-primary">AssetOS</span>
      </div>
      <NavLinks />
      <div className="mt-auto">
        <ThemeToggleBlock />
      </div>
    </aside>
  )
}

export function MobileNav({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="flex w-[min(100%,18rem)] flex-col p-0 panel-glow">
        <SheetHeader className="border-b border-border px-4 py-4 text-left">
          <SheetTitle className="font-mono text-lg text-primary">AssetOS</SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
        </SheetHeader>
        <NavLinks onNavigate={() => setOpen(false)} />
        <div className="mt-auto">
          <ThemeToggleBlock />
        </div>
      </SheetContent>
    </Sheet>
  )
}
