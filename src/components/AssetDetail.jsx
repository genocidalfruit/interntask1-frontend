import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

export function AssetDetail({ asset, open, onOpenChange }) {
  if (!asset) return null

  const registered =
    asset.createdAt != null
      ? new Date(asset.createdAt).toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel-glow max-h-[90vh] max-w-2xl overflow-y-auto border-border sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Asset details</DialogTitle>
          <DialogDescription>Read-only view of facility asset record.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-primary/40 text-primary">
            {asset.assetCategory}
          </Badge>
          <CriticalityBadge value={asset.assetCriticality} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Asset name">{asset.assetName}</Field>
          <Field label="Serial number">
            <span className="font-mono">{asset.serialNumber}</span>
          </Field>
          <Field label="Responsible team">{asset.responsibleTeam}</Field>
          <Field label="Rating">
            <span className="font-mono">{asset.assetRating}</span>
          </Field>
          <Field label="Cost">
            <span className="font-mono">{formatMoney(asset.assetCost)}</span>
          </Field>
          <Field label="Record ID">
            <span className="break-all font-mono text-xs">{asset._id}</span>
          </Field>
        </div>
        <Separator />
        <section aria-labelledby="asset-history-heading">
          <h4 id="asset-history-heading" className="font-mono text-sm font-semibold text-primary">
            Asset history
          </h4>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            {registered ? (
              <li className="rounded-md border border-border bg-muted/40 px-3 py-2">
                Asset registered on {registered}
              </li>
            ) : (
              <li className="rounded-md border border-dashed border-border px-3 py-2">
                Registration timestamp not available.
              </li>
            )}
            {/* Future: map over maintenance / audit log entries from API */}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  )
}
