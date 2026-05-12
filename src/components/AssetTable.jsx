import { useMemo, useState } from 'react'
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
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex w-full max-w-md gap-2">
            <Input
              placeholder="Search by name or serial…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="min-w-0 flex-1"
              aria-label="Search assets"
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={cn(
                    'shrink-0',
                    filtersActive && 'border-primary/80 text-primary',
                  )}
                  aria-label="Filter by category, criticality, or team"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="panel-glow w-72 border-border font-mono">
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
                      <SelectTrigger id="filter-category" className="h-9">
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
                      <SelectTrigger id="filter-criticality" className="h-9">
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
                      <SelectTrigger id="filter-team" className="h-9">
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
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="mr-1 h-4 w-4" />
          Add asset
        </Button>
      </div>

      <div className="panel-glow rounded-lg bg-card">
        <div className="overflow-x-auto">
          <Table className="font-mono">
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
                      <button className="ml-1 align-middle" onClick={(e) => e.stopPropagation()}>
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
                      <button className="ml-1 align-middle" onClick={(e) => e.stopPropagation()}>
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
                <TableHead className="w-[110px] text-center pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!loading &&
                paginated.map((a) => (
                  <TableRow key={a._id} className="cursor-pointer" onClick={() => setDetailAsset(a)}>
                    <TableCell className="text-center font-medium">{a.assetName}</TableCell>
                    <TableCell className="text-center">{a.serialNumber}</TableCell>
                    <TableCell className="text-center">{a.assetCategory}</TableCell>
                    <TableCell className="text-center">
                      <CriticalityBadge value={a.assetCriticality} />
                    </TableCell>
                    <TableCell className="text-center">{a.responsibleTeam}</TableCell>
                    <TableCell className="text-center">{a.assetRating}</TableCell>
                    <TableCell className="text-center">{formatMoney(a.assetCost)}</TableCell>
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
        </div>
        {!loading && filtered.length === 0 && (
          <p className="border-t p-6 text-center text-sm text-muted-foreground">
            No assets match your filters.
          </p>
        )}
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 font-mono text-sm">
          <span className="pl-2 text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-muted-foreground">{page} / {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
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