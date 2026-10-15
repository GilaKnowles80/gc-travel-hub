import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MobileSelect } from '@/components/ui/mobile-select';
import { Badge } from '@/components/ui/badge';
import { Hotel, MapPin, Star, Plus, Trash2 } from 'lucide-react';

export default function HotelSelector({ selectedHotels, onAdd, onRemove }) {
  const [nights, setNights] = useState(1);
  const [rooms, setRooms] = useState(1);

  const { data: hotels = [], isLoading } = useQuery({
    queryKey: ['hotels-for-package'],
    queryFn: () => base44.entities.Hotel.filter({ status: 'active' }, '-created_date', 50)
  });

  const handleAddHotel = (hotel) => {
    onAdd({
      hotel_id: hotel.id,
      hotel_name: hotel.hotel_name,
      location: hotel.location,
      rating: hotel.rating,
      price: hotel.price_per_night,
      nights: nights,
      rooms: rooms
    });
  };

  return (
    <div className="space-y-4">
      {/* Selected Hotels */}
      {selectedHotels.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-slate-900 mb-4">Selected Hotels ({selectedHotels.length})</h3>
            <div className="space-y-3">
              {selectedHotels.map((hotel, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{hotel.hotel_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-600">{hotel.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {hotel.nights} night(s) • {hotel.rooms} room(s)
                    </p>
                    <p className="text-sm font-bold text-amber-600">
                      ${(hotel.price * hotel.nights * hotel.rooms).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(idx)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stay Duration Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Nights</label>
              <MobileSelect value={nights.toString()} onValueChange={(v) => setNights(parseInt(v))} placeholder="Nights">
                <Select value={nights.toString()} onValueChange={(v) => setNights(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 10, 14].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} Night{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileSelect>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Rooms</label>
              <MobileSelect value={rooms.toString()} onValueChange={(v) => setRooms(parseInt(v))} placeholder="Rooms">
                <Select value={rooms.toString()} onValueChange={(v) => setRooms(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} Room{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MobileSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Hotels */}
      <div className="space-y-3">
        {isLoading ? (
          <Card><CardContent className="py-12 text-center">Loading hotels...</CardContent></Card>
        ) : hotels.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-600">No hotels available</CardContent></Card>
        ) : (
          hotels.map(hotel => (
            <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{hotel.hotel_name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{hotel.location}</span>
                    </div>
                    {hotel.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(parseInt(hotel.rating))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{amenity}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-slate-900">${hotel.price_per_night}</p>
                    <p className="text-xs text-slate-500 mb-3">per night</p>
                    <Button
                      size="sm"
                      onClick={() => handleAddHotel(hotel)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}