import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from 'lucide-react'
import { deleteAsset, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { AssetForm, EditAssetButton } from '@/components/AssetForm'
import { AssetDetail } from '@/components/AssetDetail'

function formatMoney(n) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n || 0)
}

function CriticalityBadge({ value }) {
  const variant =
    value === 'High' ? 'danger' : value === 'Medium' ? 'warning' : value === 'Low' ? 'success' : 'secondary'
  return <Badge variant={variant}>{value}</Badge>
}

function TableSkeletonRows({ rows = 5 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={`sk-${i}`}>
      {Array.from({ length: 8 }).map((__, j) => (
        <TableCell key={j}>
          <Skeleton className="mx-auto h-4 w-full max-w-[120px]" />
        </TableCell>
      ))}
    </TableRow>
  ))
}

export function AssetTable({ assets, loading, error }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterCriticality, setFilterCriticality] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editAsset, setEditAsset] = useState(null)
  const [detailAsset, setDetailAsset] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 5
  const [sortBy, setSortBy] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [filterRefreshing, setFilterRefreshing] = useState(false)
  const prevFilterKeyRef = useRef(null)

  const filterDepsKey = useMemo(
    () => `${search}\0${filterCategory}\0${filterCriticality}\0${filterTeam}`,
    [search, filterCategory, filterCriticality, filterTeam],
  )

  useEffect(() => {
    if (loading) return
    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterDepsKey
      return
    }
    if (prevFilterKeyRef.current === filterDepsKey) return
    prevFilterKeyRef.current = filterDepsKey
    setFilterRefreshing(true)
    const id = window.setTimeout(() => setFilterRefreshing(false), 280)
    return () => window.clearTimeout(id)
  }, [filterDepsKey, loading])

  const showBodySkeleton = loading || filterRefreshing
  const tableBodyContentKey = `${filterDepsKey}|${page}|${sortBy ?? ''}|${sortDir}`

  const filtersActive =
    filterCategory !== 'all' || filterCriticality !== 'all' || filterTeam !== 'all'

  const clearFilters = () => {
    setFilterCategory('all')
    setFilterCriticality('all')
    setFilterTeam('all')
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let result = assets.filter((a) => {
      if (filterCategory !== 'all' && a.assetCategory !== filterCategory) return false
      if (filterCriticality !== 'all' && a.assetCriticality !== filterCriticality) return false
      if (filterTeam !== 'all' && a.responsibleTeam !== filterTeam) return false
      if (!q) return true
      const name = (a.assetName || '').toLowerCase()
      const serial = (a.serialNumber || '').toLowerCase()
      return name.includes(q) || serial.includes(q)
    })
    if (sortBy) {
      result = [...result].sort((a, b) => {
        const aVal = sortBy === 'cost' ? Number(a.assetCost) || 0 : (a.assetRating || '').toString()
        const bVal = sortBy === 'cost' ? Number(b.assetCost) || 0 : (b.assetRating || '').toString()
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [assets, search, filterCategory, filterCriticality, filterTeam, sortBy, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAsset(id),
    onSuccess: () => {
      toast.success('Asset deleted')
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setDeleteTarget(null)
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Delete failed')
    },
  })

  if (error) {
    return (
      <div className="panel-glow rounded-lg bg-card p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : 'Could not load assets. Check API connection.'}
      </div>
    )
  }

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-1 flex-col gap-2 sm:max-w-xl sm:flex-row sm:items-center">
          <div className="flex w-full gap-2 sm:max-w-md">
            <Input
              placeholder="Search by name or serial…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="min-w-0 flex-1 touch-manipulation"
              aria-label="Search assets"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'shrink-0 touch-manipulation',
                    filtersActive && 'border-primary/80 text-primary',
                  )}
                  aria-label="Filter by category, criticality, or team"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="panel-glow border-border font-mono">
                <div className="space-y-3">
                  <p className="text-sm font-semibold leading-none">Filters</p>
                  <div className="space-y-2">
                    <Label htmlFor="filter-category" className="text-xs text-muted-foreground">
                      Category
                    </Label>
                    <Select
                      value={filterCategory}
                      onValueChange={(v) => { setFilterCategory(v); setPage(1) }}
                    >
                      <SelectTrigger id="filter-category">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        <SelectItem value="Chiller">Chiller</SelectItem>
                        <SelectItem value="Pumps">Pumps</SelectItem>
                        <SelectItem value="AHU">AHU</SelectItem>
                        <SelectItem value="Cooling Tower">Cooling Tower</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-criticality" className="text-xs text-muted-foreground">
                      Criticality
                    </Label>
                    <Select
                      value={filterCriticality}
                      onValueChange={(v) => { setFilterCriticality(v); setPage(1) }}
                    >
                      <SelectTrigger id="filter-criticality">
                        <SelectValue placeholder="Criticality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-team" className="text-xs text-muted-foreground">
                      Team
                    </Label>
                    <Select
                      value={filterTeam}
                      onValueChange={(v) => { setFilterTeam(v); setPage(1) }}
                    >
                      <SelectTrigger id="filter-team">
                        <SelectValue placeholder="Team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All teams</SelectItem>
                        <SelectItem value="HVAC">HVAC</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {filtersActive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full text-xs"
                      onClick={clearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="h-11 w-full shrink-0 touch-manipulation sm:h-9 sm:w-auto"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add asset
        </Button>
      </div>

      <div className="panel-glow overflow-hidden rounded-lg bg-card">
          <Table className="w-full border-collapse font-mono xl:min-w-0">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Asset name</TableHead>
                <TableHead className="text-center">Serial no.</TableHead>
                <TableHead className="text-center">Category</TableHead>
                <TableHead className="text-center">Criticality</TableHead>
                <TableHead className="text-center">Team</TableHead>
                <TableHead className="text-center">Rating
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="ml-1 inline-flex min-h-10 min-w-10 items-center justify-center rounded-md align-middle touch-manipulation active:bg-muted sm:min-h-0 sm:min-w-0 sm:p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sortBy === 'rating' ? (
                          sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuItem onClick={() => { setSortBy('rating'); setSortDir('asc'); setPage(1) }}>
                        <ArrowUp className="mr-1 h-3 w-3" /> Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('rating'); setSortDir('desc'); setPage(1) }}>
                        <ArrowDown className="mr-1 h-3 w-3" /> Descending
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="text-center">Cost
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="ml-1 inline-flex min-h-10 min-w-10 items-center justify-center rounded-md align-middle touch-manipulation active:bg-muted sm:min-h-0 sm:min-w-0 sm:p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sortBy === 'cost' ? (
                          sortDir === 'asc' ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center">
                      <DropdownMenuItem onClick={() => { setSortBy('cost'); setSortDir('asc'); setPage(1) }}>
                        <ArrowUp className="mr-1 h-3 w-3" /> Ascending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setSortBy('cost'); setSortDir('desc'); setPage(1) }}>
                        <ArrowDown className="mr-1 h-3 w-3" /> Descending
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
                <TableHead className="w-[7.5rem] min-w-[7.5rem] text-center sm:w-[110px] sm:min-w-0">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody
              key={showBodySkeleton ? 'skeleton' : tableBodyContentKey}
              className={cn(
                !showBodySkeleton &&
                  'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200',
              )}
            >
              {showBodySkeleton && <TableSkeletonRows rows={PAGE_SIZE} />}
              {!showBodySkeleton &&
                paginated.map((a) => (
                  <TableRow
                    key={a._id}
                    className="cursor-pointer touch-manipulation active:bg-muted/60"
                    onClick={() => setDetailAsset(a)}
                  >
                    <TableCell className="text-center font-medium truncate max-w-[160px]" title={a.assetName}>{a.assetName}</TableCell>
                    <TableCell className="text-center truncate max-w-[120px]" title={a.serialNumber}>{a.serialNumber}</TableCell>
                    <TableCell className="text-center truncate max-w-[100px]">{a.assetCategory}</TableCell>
                    <TableCell className="text-center">
                      <CriticalityBadge value={a.assetCriticality} />
                    </TableCell>
                    <TableCell className="text-center truncate max-w-[110px]">{a.responsibleTeam}</TableCell>
                    <TableCell className="text-center truncate max-w-[80px]">{a.assetRating}</TableCell>
                    <TableCell className="text-center truncate max-w-[100px]">{formatMoney(a.assetCost)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <EditAssetButton asset={a} onOpenChange={setEditAsset} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${a.assetName}`}
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(a) }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        {!showBodySkeleton && filtered.length === 0 && (
          <p className="border-t p-6 text-center text-sm text-muted-foreground">
            No assets match your filters.
          </p>
        )}
      </div>

      {!loading && !filterRefreshing && filtered.length > PAGE_SIZE && (
        <div className="flex flex-col gap-3 px-2 font-mono text-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <span className="text-center text-muted-foreground sm:pl-2 sm:text-left">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="touch-manipulation"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[4.5rem] text-center text-muted-foreground">{page} / {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
              className="touch-manipulation"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AssetForm open={createOpen} onOpenChange={setCreateOpen} />
      <AssetForm
        open={!!editAsset}
        onOpenChange={(open) => !open && setEditAsset(null)}
        editAsset={editAsset}
      />
      <AssetDetail
        asset={detailAsset}
        open={!!detailAsset}
        onOpenChange={(open) => !open && setDetailAsset(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="panel-glow border-border font-mono">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{' '}
              <span className="font-medium text-foreground">{deleteTarget?.assetName}</span> from the
              registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget?._id) deleteMutation.mutate(deleteTarget._id)
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}