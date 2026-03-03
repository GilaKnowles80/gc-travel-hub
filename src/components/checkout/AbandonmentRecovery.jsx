import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AbandonmentRecovery() {
  const [pending, setPending] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("pending_flight_checkout");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Show if abandoned within last 24 hours
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setPending(data);
        }
      } catch (e) {
        localStorage.removeItem("pending_flight_checkout");
      }
    }
  }, []);

  if (!pending) return null;

  return (
    <Card className="border-amber-200 bg-amber-50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">Complete Your Booking</h3>
            <p className="text-sm text-amber-800 mb-3">
              You have an incomplete {pending.cabin_class} flight booking for {pending.passenger_name}. Total: ₱{pending.total_price?.toLocaleString()}
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  navigate(`/FlightCheckout?flightId=${pending.flight_id}&cabin=${pending.cabin_class}&passengers=${pending.number_of_passengers}`);
                }}
              >
                Resume Checkout
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem("pending_flight_checkout");
                  setPending(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}