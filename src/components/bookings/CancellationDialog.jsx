import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function CancellationDialog({ booking, bookingType, open, onClose, onSuccess }) {
  const [reason, setReason] = useState('');

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const functionName = bookingType === 'flight' ? 'cancelFlightBooking' : 'cancelHotelBooking';
      return await base44.functions.invoke(functionName, {
        bookingId: booking.id,
        reason
      });
    },
    onSuccess: () => {
      toast.success('Booking cancelled successfully');
      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel booking');
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Cancellation Policy</p>
              <p>Your booking will be cancelled and a refund will be processed within 5-7 business days if applicable.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason for Cancellation (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you're cancelling..."
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={cancelMutation.isPending}>
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}