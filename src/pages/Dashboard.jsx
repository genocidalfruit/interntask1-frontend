import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAssets } from '@/lib/api'
import { Topbar } from '@/components/Topbar'
import { KPICards } from '@/components/KPICards'
import { Charts } from '@/components/Charts'
import { AssetTable } from '@/components/AssetTable'

export function Dashboard() {
  const { data: assets = [], isPending, isError, error } = useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  })

  const kpis = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + (Number(a.assetCost) || 0), 0)
    const totalCount = assets.length
    const highCount = assets.filter((a) => a.assetCriticality === 'High').length
    const categoryCount = new Set(assets.map((a) => a.assetCategory).filter(Boolean)).size
    return { totalValue, totalCount, highCount, categoryCount }
  }, [assets])

  return (
    <div className="flex min-h-0 min-h-dvh flex-1 flex-col">
      <Topbar title="Dashboard" />
      <main className="flex-1 space-y-6 overflow-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-8 sm:p-4 md:p-6">
        <KPICards loading={isPending} kpis={kpis} />
        <Charts assets={assets} />
        <AssetTable assets={assets} loading={isPending} error={isError ? error : null} />
      </main>
    </div>
  )
}
