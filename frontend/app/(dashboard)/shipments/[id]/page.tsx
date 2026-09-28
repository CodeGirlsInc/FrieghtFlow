'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Shipment, ShipmentStatus, ShipmentStatusHistory } from '../../../../types/shipment.types';
import { Payment, PaymentStatus } from '../../../../types/payment.types';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { paymentApi } from '../../../../lib/api/payments.api';
import { formatMoney } from '../../../../lib/format/currency';
import { useAuthStore } from '../../../../stores/auth.store';
import { StatusBadge } from '../../../../components/shipment/status-badge';
import { StatusTimeline } from '../../../../components/shipment/status-timeline';
import { SubmitReviewForm } from '../../../../components/reviews/SubmitReviewForm';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';

/**
 * Cap on a free-text reason/note. The backend (`CancelBody`/`ResolveDisputeBody`
 * in `shipments.controller.ts`) applies no length limit and the
 * `shipment_status_history.reason` column is `text`, so this is a client-side
 * usability bound only — long enough to explain a cancellation or a dispute
 * decision, short enough that the timeline stays readable.
 */
const MAX_REASON_LENGTH = 500;

/**
 * The confirmation step that both destructive, audit-trailed actions share
 * (FE-190 / FE-191): cancelling a shipment and resolving a dispute. Modelled
 * on the `ConfirmDialog` in `app/(dashboard)/admin/disputes/page.tsx` so the
 * two admin paths look and behave alike, with the a11y that dialog is missing
 * (dialog role, labelled title/description, real `<label>` for the field).
 */
function ReasonConfirmDialog({
  title,
  description,
  fieldLabel,
  placeholder,
  confirmLabel,
  destructive = false,
  loading,
  reason,
  onReason,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  fieldLabel: string;
  placeholder: string;
  confirmLabel: string;
  destructive?: boolean;
  loading: boolean;
  reason: string;
  onReason: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const trimmed = reason.trim();
  const tooLong = trimmed.length > MAX_REASON_LENGTH;
  const fieldId = 'reason-confirm-field';
  const hintId = 'reason-confirm-hint';
  const errorId = 'reason-confirm-error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reason-confirm-title"
        aria-describedby="reason-confirm-description"
        className="bg-card rounded-lg border border-border shadow-xl w-full max-w-md p-6 space-y-4"
      >
        <h3 id="reason-confirm-title" className="font-semibold text-foreground">
          {title}
        </h3>
        <p id="reason-confirm-description" className="text-sm text-muted-foreground">
          {description}
        </p>
        <div className="space-y-1">
          <label htmlFor={fieldId} className="text-xs font-medium text-foreground">
            {fieldLabel}
          </label>
          <textarea
            id={fieldId}
            autoFocus
            className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 resize-none"
            rows={3}
            maxLength={MAX_REASON_LENGTH}
            placeholder={placeholder}
            aria-invalid={tooLong}
            aria-describedby={tooLong ? `${hintId} ${errorId}` : hintId}
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onCancel();
            }}
          />
          <p id={hintId} className="text-xs text-muted-foreground">
            Required, up to {MAX_REASON_LENGTH} characters. This is recorded on
            the shipment&apos;s status history and shown to everyone who can view it.
          </p>
          {tooLong && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              Please shorten this to {MAX_REASON_LENGTH} characters or fewer.
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            size="sm"
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading || !trimmed || tooLong}
          >
            {loading ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The reason-requiring actions the detail page gates behind a confirm step. */
type PendingAction =
  | { kind: 'cancel' }
  | { kind: 'resolve'; resolution: ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED };

export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [history, setHistory] = useState<ShipmentStatusHistory[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [reason, setReason] = useState('');

  const reload = useCallback(async () => {
    const [s, h] = await Promise.all([
      shipmentApi.getById(id),
      shipmentApi.getHistory(id),
    ]);
    setShipment(s);
    setHistory(h);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    reload()
      .catch(() => toast.error('Failed to load shipment'))
      .finally(() => setLoading(false));
  }, [reload]);

  const act = async (fn: () => Promise<unknown>, successMsg: string, onDone?: () => void) => {
    setActionLoading(true);
    try {
      await fn();
      toast.success(successMsg);
      await reload();
      onDone?.();
    } catch {
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // FE-190 / FE-191: both reason-requiring actions open a confirmation step
  // instead of firing on a single click.
  const openAction = (action: PendingAction) => {
    setReason('');
    setPendingAction(action);
  };

  const closeAction = () => {
    setPendingAction(null);
    setReason('');
  };

  const confirmAction = () => {
    if (!pendingAction || !shipment) return;
    const note = reason.trim();
    // Belt and braces: the dialog already disables Confirm in this state.
    if (!note || note.length > MAX_REASON_LENGTH) return;
    const action = pendingAction;
    if (action.kind === 'cancel') {
      act(() => shipmentApi.cancel(shipment.id, note), 'Shipment cancelled', closeAction);
    } else {
      const word = action.resolution === ShipmentStatus.COMPLETED ? 'completed' : 'cancelled';
      act(
        () => shipmentApi.resolveDispute(shipment.id, action.resolution, note),
        `Dispute resolved — ${word}`,
        closeAction,
      );
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Shipment not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const isShipper = user?.id === shipment.shipperId;
  const isCarrier = user?.id === shipment.carrierId;
  const isAdmin = user?.role === 'admin';

  // Never throws on an unrecognised currency code — see lib/format/currency.ts.
  const formattedPrice = formatMoney(shipment.price, shipment.currency);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {pendingAction?.kind === 'cancel' && (
        <ReasonConfirmDialog
          title="Cancel this shipment?"
          description="This action cannot be undone."
          fieldLabel="Reason for cancelling"
          placeholder="Explain why this shipment is being cancelled…"
          confirmLabel="Cancel shipment"
          destructive
          loading={actionLoading}
          reason={reason}
          onReason={setReason}
          onConfirm={confirmAction}
          onCancel={closeAction}
        />
      )}
      {pendingAction?.kind === 'resolve' && (
        <ReasonConfirmDialog
          title={`Resolve as ${pendingAction.resolution === ShipmentStatus.COMPLETED ? 'Completed' : 'Cancelled'}?`}
          description="This action cannot be undone."
          fieldLabel="Resolution Note"
          placeholder="Explain the resolution…"
          confirmLabel="Confirm"
          destructive={pendingAction.resolution === ShipmentStatus.CANCELLED}
          loading={actionLoading}
          reason={reason}
          onReason={setReason}
          onConfirm={confirmAction}
          onCancel={closeAction}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="text-xs text-muted-foreground hover:text-foreground mb-2 block"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-foreground font-mono">
            {shipment.trackingNumber}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {shipment.origin} → {shipment.destination}
          </p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cargo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{shipment.cargoDescription}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Weight</span>
                  <p className="font-medium">{Number(shipment.weightKg).toLocaleString()} kg</p>
                </div>
                {shipment.volumeCbm && (
                  <div>
                    <span className="text-muted-foreground">Volume</span>
                    <p className="font-medium">{Number(shipment.volumeCbm)} m³</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Price</span>
                  <p className="font-semibold text-foreground">{formattedPrice}</p>
                </div>
              </div>
              {shipment.notes && (
                <p className="text-muted-foreground italic text-sm border-t pt-2">
                  {shipment.notes}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipper</span>
                <span className="font-medium">
                  {shipment.shipper.firstName} {shipment.shipper.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier</span>
                <span className="font-medium">
                  {shipment.carrier
                    ? `${shipment.carrier.firstName} ${shipment.carrier.lastName}`
                    : '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {/* Carrier actions */}
              {shipment.status === ShipmentStatus.PENDING && !isShipper && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => act(() => shipmentApi.accept(shipment.id), 'Shipment accepted!')}
                >
                  Accept Job
                </Button>
              )}
              {shipment.status === ShipmentStatus.ACCEPTED && isCarrier && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => act(() => shipmentApi.pickup(shipment.id), 'Marked as picked up!')}
                >
                  Mark Picked Up
                </Button>
              )}
              {shipment.status === ShipmentStatus.IN_TRANSIT && isCarrier && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    act(() => shipmentApi.markDelivered(shipment.id), 'Marked as delivered!')
                  }
                >
                  Mark Delivered
                </Button>
              )}

              {/* Shipper actions */}
              {shipment.status === ShipmentStatus.DELIVERED && isShipper && (
                <Button
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    act(() => shipmentApi.confirmDelivery(shipment.id), 'Delivery confirmed!')
                  }
                >
                  Confirm Delivery
                </Button>
              )}

              {/* Cancel — opens a confirmation step that collects a real reason */}
              {[ShipmentStatus.PENDING, ShipmentStatus.ACCEPTED].includes(shipment.status) &&
                (isShipper || isCarrier || isAdmin) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => openAction({ kind: 'cancel' })}
                  >
                    Cancel
                  </Button>
                )}

              {/* Dispute */}
              {[ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELIVERED].includes(shipment.status) &&
                (isShipper || isCarrier) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() =>
                      act(
                        () => shipmentApi.raiseDispute(shipment.id, 'Dispute raised by user'),
                        'Dispute raised',
                      )
                    }
                  >
                    Raise Dispute
                  </Button>
                )}

              {/* Admin resolve — same note + confirm requirement as the admin
                  dispute queue in admin/disputes/page.tsx */}
              {shipment.status === ShipmentStatus.DISPUTED && isAdmin && (
                <>
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      openAction({ kind: 'resolve', resolution: ShipmentStatus.COMPLETED })
                    }
                  >
                    Resolve: Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() =>
                      openAction({ kind: 'resolve', resolution: ShipmentStatus.CANCELLED })
                    }
                  >
                    Resolve: Cancel
                  </Button>
                </>
              )}

              {[ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED].includes(shipment.status) && (
                <p className="text-sm text-muted-foreground">
                  This shipment is {shipment.status} — no further actions available.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: timeline */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline history={history} />
            </CardContent>
          </Card>

          {shipment.status === ShipmentStatus.COMPLETED && isShipper && shipment.carrierId && (
            <SubmitReviewForm shipmentId={shipment.id} title="Rate your carrier" />
          )}
        </div>
      </div>
    </div>
  );
}
