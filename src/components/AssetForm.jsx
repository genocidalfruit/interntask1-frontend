import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createAsset, ApiError } from '@/lib/api'
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

export function AssetForm({ open, onOpenChange }) {
  const queryClient = useQueryClient()
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
      reset(defaults)
      clearErrors()
    }
  }, [open, reset, clearErrors])

  const mutation = useMutation({
    mutationFn: (data) => createAsset(data),
    onSuccess: () => {
      toast.success('Asset created successfully')
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
      toast.error(err instanceof ApiError ? err.message : 'Failed to create asset')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      assetCost: Number(data.assetCost),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="panel-glow max-h-[90vh] max-w-lg overflow-y-auto border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create asset</DialogTitle>
          <DialogDescription>Add a new facility asset to the inventory.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
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
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Create asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
