import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HotelPriceAlertDialog({ hotel, roomType, open, onOpenChange }) {
  const [targetPrice, setTargetPrice] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [creating, setCreating] = useState(false);

  const createAlert = async () => {
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      toast.error('Please login to set price alerts');
      return;
    }

    if (!targetPrice || !checkIn || !checkOut) {
      toast.error('Please fill all fields');
      return;
    }

    setCreating(true);
    try {
      await base44.entities.HotelPriceAlert.create({
        user_email: user.email,
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        location: hotel.location,
        room_type: roomType.type,
        check_in_date: checkIn,
        check_out_date: checkOut,
        target_price: parseFloat(targetPrice),
        current_price: roomType.price_per_night
      });

      toast.success('Price alert created! We\'ll notify you when prices drop.');
      onOpenChange(false);
      setTargetPrice('');
      setCheckIn('');
      setCheckOut('');
    } catch (error) {
      toast.error('Failed to create alert');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Set Hotel Price Alert
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">
              <strong>{hotel?.name}</strong> - {roomType?.type}
            </p>
            <p className="text-xs text-slate-500">
              Current Price: ${roomType?.price_per_night}/night
            </p>
          </div>

          <div>
            <Label>Check-in Date</Label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label>Check-out Date</Label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label>Target Price (per night)</Label>
            <Input
              type="number"
              placeholder="Enter your target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              min="0"
              step="0.01"
            />
            <p className="text-xs text-slate-500 mt-1">
              We'll notify you when price drops to or below this amount
            </p>
          </div>

          <Button onClick={createAlert} disabled={creating} className="w-full">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Alert'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}