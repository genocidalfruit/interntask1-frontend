import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400',
        warning: 'border-amber-500/40 bg-amber-500/15 text-amber-400',
        danger: 'border-red-500/40 bg-red-500/15 text-red-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

// badgeVariants consumed by other UI modules
// eslint-disable-next-line react-refresh/only-export-components -- variant map
export { Badge, badgeVariants }
