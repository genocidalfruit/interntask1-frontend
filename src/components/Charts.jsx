import { useMemo } from 'react'
import { useMaxWidth } from '@/lib/useMediaQuery'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

const EMERALD = ['#059669', '#10b981', '#047857', '#34d399', '#6ee7b7', '#065f46', '#22c55e']

function ChartCard({ title, children, className = '' }) {
  return (
    <div
      className={`panel-glow flex min-h-[260px] flex-col rounded-lg bg-card p-3 sm:min-h-[280px] sm:p-4 ${className}`}
    >
      <h3 className="mb-2 font-mono text-sm font-semibold text-foreground">{title}</h3>
      <div className="min-h-[200px] flex-1 sm:min-h-[220px]">{children}</div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
      No data to display
    </div>
  )
}

const currency = (v) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(v)

export function Charts({ assets }) {
  const narrow = useMaxWidth(639)

  const pieData = useMemo(() => {
    const map = new Map()
    for (const a of assets) {
      const c = a.assetCategory || 'Unknown'
      map.set(c, (map.get(c) || 0) + 1)
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [assets])

  const teamData = useMemo(() => {
    const map = new Map()
    for (const a of assets) {
      const t = a.responsibleTeam || 'Unknown'
      map.set(t, (map.get(t) || 0) + 1)
    }
    return [...map.entries()].map(([name, count]) => ({ name, count }))
  }, [assets])

  const topCost = useMemo(() => {
    return [...assets]
      .sort((a, b) => (b.assetCost || 0) - (a.assetCost || 0))
      .slice(0, 5)
      .map((a) => ({
        name:
          (a.assetName || 'Asset').length > 28
            ? `${(a.assetName || '').slice(0, 26)}…`
            : a.assetName || 'Asset',
        fullName: a.assetName,
        cost: a.assetCost || 0,
      }))
  }, [assets])

  const pieInner = narrow ? 38 : 52
  const pieOuter = narrow ? 58 : 80

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      <ChartCard title="Assets by category">
        {pieData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={narrow ? 220 : 240}>
            <PieChart>
              <Legend
                verticalAlign="bottom"
                height={narrow ? 48 : 36}
                wrapperStyle={{
                  fontSize: narrow ? '10px' : '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--color-foreground)',
                  backgroundColor: 'var(--color-muted)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
              />
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                itemStyle={{ color: 'var(--color-muted-foreground)' }}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={pieInner}
                outerRadius={pieOuter}
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={EMERALD[i % EMERALD.length]} stroke="#10b98140" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Assets by responsible team">
        {teamData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height={narrow ? 220 : 240}>
            <BarChart
              layout="vertical"
              data={teamData}
              margin={{ left: narrow ? 4 : 8, right: narrow ? 8 : 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--color-muted-foreground)', fontSize: narrow ? 10 : 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={narrow ? 58 : 72}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: narrow ? 10 : 11 }}
              />
              <Tooltip
                formatter={(v) => [v, 'Assets']}
                labelFormatter={(label) => label}
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Top 5 assets by cost" className="lg:col-span-1">
        {topCost.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="flex h-full flex-col overflow-hidden pt-8">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Asset</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Cost</th>
                </tr>
              </thead>
              <tbody>
                {topCost.map((item, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-foreground" title={item.fullName}>{item.name}</td>
                    <td className="py-2 text-right font-mono text-foreground">{currency(item.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  )
}
