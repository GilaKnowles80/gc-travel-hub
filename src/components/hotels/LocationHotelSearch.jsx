import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function LocationHotelSearch({ onResults }) {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(5);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(1);

  const searchMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('searchHotelsByGeocodeAMADEUS', {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius,
        checkInDate,
        checkOutDate,
        adults
      });
      return response.data;
    },
    onSuccess: (data) => {
      onResults?.(data.hotels || []);
      toast.success(`Found ${data.hotels?.length || 0} hotels`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to search hotels');
    }
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          toast.success('Location detected');
        },
        () => {
          toast.error('Failed to get location');
        }
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Search Hotels by Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Latitude</Label>
            <Input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="52.3676"
            />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="4.9041"
            />
          </div>
        </div>

        <Button variant="outline" onClick={getCurrentLocation} className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Use My Current Location
        </Button>

        <div>
          <Label>Radius (km)</Label>
          <Input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            min={1}
            max={50}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Check-in</Label>
            <Input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Check-out</Label>
            <Input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Adults</Label>
          <Input
            type="number"
            value={adults}
            onChange={(e) => setAdults(parseInt(e.target.value))}
            min={1}
            max={10}
          />
        </div>

        <Button
          onClick={() => searchMutation.mutate()}
          disabled={!latitude || !longitude || !checkInDate || !checkOutDate || searchMutation.isPending}
          className="w-full"
        >
          {searchMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Search Hotels
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}