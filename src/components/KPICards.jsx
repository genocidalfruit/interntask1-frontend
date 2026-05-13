import { useState } from 'react'
import { DollarSign, Boxes, AlertTriangle, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

const items = [
  {
    key: 'value',
    title: 'Total Inventory Value',
    icon: DollarSign,
    format: (v) => formatCurrency(v),
  },
  {
    key: 'count',
    title: 'Total Assets',
    icon: Boxes,
    format: (v) => String(v),
  },
  {
    key: 'high',
    title: 'High Criticality',
    icon: AlertTriangle,
    format: (v) => String(v),
  },
  {
    key: 'categories',
    title: 'Asset Categories',
    icon: Layers,
    format: (v) => String(v),
  },
]

const KPI_SUBTITLE_MESSAGES = [
  'System Ready. Your asset overview is live.',
  'Inventory Synced. Here is your current standing.',
  "Data Loaded. What's the move today?",
  'The Board is Set. Your assets at a glance.',
  "Welcome Back. Here's the state of your inventory.",
  'Your Ledger is Updated. Dive into the details.',
]

export function KPICards({ loading, kpis }) {
  const [subtitle] = useState(
    () =>
      KPI_SUBTITLE_MESSAGES[Math.floor(Math.random() * KPI_SUBTITLE_MESSAGES.length)],
  )

  if (loading) {
    return (
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <CardContent className="flex min-h-[9rem] flex-col items-start justify-end gap-2 px-1 pb-4 pt-6 sm:h-36 sm:justify-start sm:pt-12">
            <p className="font-mono text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Welcome!
            </p>
            <p className="font-mono text-xs leading-snug text-muted-foreground sm:text-sm">
              Loading your data...
            </p>
          </CardContent>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {items.map((item) => (
            <Card key={item.key} className="panel-glow overflow-hidden border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-28" />
              </CardContent>
              <div className="h-0.5 w-full bg-primary/80" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const values = {
    value: kpis.totalValue,
    count: kpis.totalCount,
    high: kpis.highCount,
    categories: kpis.categoryCount,
  }

  return (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <CardContent className="flex min-h-[9rem] flex-col items-start justify-end gap-2 px-1 pb-4 pt-6 sm:h-36 sm:justify-start sm:pt-12">
            <p className="font-mono text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Welcome!
            </p>
            <p className="font-mono text-xs leading-snug text-muted-foreground sm:text-sm">{subtitle}</p>
          </CardContent>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.key}
              className="panel-glow overflow-hidden border-border shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <Icon className="h-4 w-4 text-primary" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {item.format(values[item.key])}
                </p>
              </CardContent>
              <div className="h-0.5 w-full bg-primary/70" />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
