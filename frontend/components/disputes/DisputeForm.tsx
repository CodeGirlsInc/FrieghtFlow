'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { apiClient } from '../../lib/api/client';

const DISPUTE_CATEGORIES = [
  'Damaged cargo',
  'Late delivery',
  'Wrong item or quantity',
  'Lost shipment',
  'Billing dispute',
  'Service quality',
  'Other',
] as const;

const schema = z.object({
  category: z.enum(DISPUTE_CATEGORIES, 'Select a dispute category'),
  reason: z.string().min(10, 'Please describe the issue (min 10 characters)'),
});
type FormData = z.infer<typeof schema>;

interface Props {
  shipmentId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function DisputeForm({ shipmentId, onSuccess, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Other' },
  });

  const onSubmit = async (data: FormData) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('reason', data.reason);
      const files = fileRef.current?.files;
      if (files) {
        Array.from(files).forEach((f) => formData.append('evidence', f));
      }

      await apiClient(`/shipments/${shipmentId}/dispute`, {
        method: 'POST',
        body: formData,
        headers: {},
      });

      toast.success('Dispute filed. Escrow funds will be held until resolution.');
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? 'Failed to file dispute.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">File a Dispute</h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Escrow warning */}
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm">
          <p className="font-medium text-yellow-700 dark:text-yellow-400">Escrow funds will be held</p>
          <p className="text-muted-foreground mt-1">
            Filing a dispute pauses the release of escrowed funds until the dispute is resolved by an administrator.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...register('category')}
            >
              {DISPUTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Description</Label>
            <textarea
              id="reason"
              rows={4}
              placeholder="Describe the issue in detail…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence (optional)</Label>
            <input
              id="evidence"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              ref={fileRef}
              aria-label="Upload evidence files"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">PDF, images, or Word documents. Max 10 MB each.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="destructive" disabled={isSubmitting || uploading}>
              {isSubmitting || uploading ? 'Submitting…' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
