'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DisputeForm } from './DisputeForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface RaiseDisputeButtonProps {
  shipmentId: string;
  onSuccess?: () => void;
}

export function RaiseDisputeButton({ shipmentId, onSuccess }: RaiseDisputeButtonProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          Raise Dispute
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Raise a Dispute</DialogTitle>
        </DialogHeader>
        <DisputeForm shipmentId={shipmentId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
