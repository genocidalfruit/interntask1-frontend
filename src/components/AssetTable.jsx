import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Eye, Trash2 } from 'lucide-react'
import { deleteAsset, ApiError } from '@/lib/api'
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
import { Skeleton } from '@/components/ui/skeleton'
import { AssetForm } from '@/components/AssetForm'
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
  const [team, setTeam] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailAsset, setDetailAsset] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return assets.filter((a) => {
      const matchTeam = team === 'all' || a.responsibleTeam === team
      if (!matchTeam) return false
      if (!q) return true
      const name = (a.assetName || '').toLowerCase()
      const serial = (a.serialNumber || '').toLowerCase()
      return name.includes(q) || serial.includes(q)
    })
  }, [assets, search, team])

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
      <div className="panel-glow rounded-lg border border-destructive/40 bg-card p-6 text-sm text-destructive">
        {error instanceof ApiError ? error.message : 'Could not load assets. Check API connection.'}
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by name or serial…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
            aria-label="Search assets"
          />
          <Select value={team} onValueChange={setTeam}>
            <SelectTrigger className="w-full sm:w-[200px]">
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
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          Add asset
        </Button>
      </div>

      <div className="panel-glow rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset name</TableHead>
                <TableHead>Serial no.</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
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
                filtered.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.assetName}</TableCell>
                    <TableCell className="font-mono text-xs">{a.serialNumber}</TableCell>
                    <TableCell>{a.assetCategory}</TableCell>
                    <TableCell>
                      <CriticalityBadge value={a.assetCriticality} />
                    </TableCell>
                    <TableCell>{a.responsibleTeam}</TableCell>
                    <TableCell className="font-mono text-xs">{a.assetRating}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatMoney(a.assetCost)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDetailAsset(a)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${a.assetName}`}
                          onClick={() => setDeleteTarget(a)}
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
          <p className="border-t border-border p-6 text-center text-sm text-muted-foreground">
            No assets match your filters.
          </p>
        )}
      </div>

      <AssetForm open={createOpen} onOpenChange={setCreateOpen} />
      <AssetDetail
        asset={detailAsset}
        open={!!detailAsset}
        onOpenChange={(open) => !open && setDetailAsset(null)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="panel-glow border-border">
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
