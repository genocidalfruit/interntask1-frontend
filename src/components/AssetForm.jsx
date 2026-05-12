import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import { createAsset, updateAsset, ApiError } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  assetName: z.string().min(1, 'Asset name is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  assetCategory: z.enum(['Chiller', 'Pumps', 'AHU', 'Cooling Tower']),
  assetCriticality: z.enum(['High', 'Medium', 'Low']),
  responsibleTeam: z.enum(['HVAC', 'Plumbing', 'Electrical']),
  assetRating: z.string().min(1, 'Asset rating is required'),
  assetCost: z
    .string()
    .min(1, 'Cost is required')
    .refine((s) => !Number.isNaN(Number(s)) && Number(s) > 0, 'Must be a positive number'),
})

const defaults = {
  assetName: '',
  serialNumber: '',
  assetCategory: 'Chiller',
  assetCriticality: 'Medium',
  responsibleTeam: 'HVAC',
  assetRating: '',
  assetCost: '',
}

export function AssetForm({ open, onOpenChange, editAsset = null }) {
  const queryClient = useQueryClient()
  const isEditMode = !!editAsset

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (open) {
      if (editAsset) {
        reset({
          assetName: editAsset.assetName || '',
          serialNumber: editAsset.serialNumber || '',
          assetCategory: editAsset.assetCategory || 'Chiller',
          assetCriticality: editAsset.assetCriticality || 'Medium',
          responsibleTeam: editAsset.responsibleTeam || 'HVAC',
          assetRating: editAsset.assetRating || '',
          assetCost: editAsset.assetCost?.toString() || '',
        })
      } else {
        reset(defaults)
      }
      clearErrors()
    }
  }, [open, editAsset, reset, clearErrors])

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, assetCost: Number(data.assetCost) }
      if (isEditMode) {
        return updateAsset(editAsset._id, payload)
      }
      return createAsset(payload)
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Asset updated successfully' : 'Asset created successfully')
      reset(defaults)
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 400) {
        const msg = err.message.toLowerCase()
        if (msg.includes('serialnumber') || msg.includes('serial number')) {
          setError('serialNumber', {
            type: 'server',
            message: 'This serial number is already registered',
          })
          return
        }
      }
      toast.error(err instanceof ApiError ? err.message : 'Failed to save asset')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel-glow max-h-[90vh] max-w-lg border-border font-mono overflow-y-auto sm:max-w-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit asset' : 'Create asset'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update facility asset details.' : 'Add a new facility asset to the inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="space-y-2">
            <Label htmlFor="assetName">Asset name</Label>
            <Input id="assetName" {...register('assetName')} autoComplete="off" />
            {errors.assetName && (
              <p className="text-xs text-destructive">{errors.assetName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial number</Label>
            <Input id="serialNumber" {...register('serialNumber')} autoComplete="off" />
            {errors.serialNumber && (
              <p className="text-xs text-destructive">{errors.serialNumber.message}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Asset category</Label>
              <Controller
                name="assetCategory"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chiller">Chiller</SelectItem>
                      <SelectItem value="Pumps">Pumps</SelectItem>
                      <SelectItem value="AHU">AHU</SelectItem>
                      <SelectItem value="Cooling Tower">Cooling Tower</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assetCategory && (
                <p className="text-xs text-destructive">{errors.assetCategory.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Criticality</Label>
              <Controller
                name="assetCriticality"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Criticality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assetCriticality && (
                <p className="text-xs text-destructive">{errors.assetCriticality.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Responsible team</Label>
            <Controller
              name="responsibleTeam"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HVAC">HVAC</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.responsibleTeam && (
              <p className="text-xs text-destructive">{errors.responsibleTeam.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetRating">Asset rating</Label>
            <Input id="assetRating" placeholder="e.g. 500 TR" {...register('assetRating')} />
            {errors.assetRating && (
              <p className="text-xs text-destructive">{errors.assetRating.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="assetCost">Asset cost (USD)</Label>
            <Input id="assetCost" type="number" min="1" step="1" {...register('assetCost')} />
            {errors.assetCost && (
              <p className="text-xs text-destructive">{errors.assetCost.message}</p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEditMode ? 'Update asset' : 'Create asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditAssetButton({ asset, onOpenChange }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Edit ${asset.assetName}`}
      onClick={(e) => { e.stopPropagation(); onOpenChange(asset) }}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  )
}