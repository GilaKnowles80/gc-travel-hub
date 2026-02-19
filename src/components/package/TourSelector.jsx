import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Star, Plus, Trash2 } from 'lucide-react';

export default function TourSelector({ selectedTours, onAdd, onRemove }) {
  const [participants, setParticipants] = useState(1);

  const { data: tours = [], isLoading } = useQuery({
    queryKey: ['tours-for-package'],
    queryFn: () => base44.entities.Tour.filter({ status: 'active' }, '-created_date', 50)
  });

  const handleAddTour = (tour) => {
    onAdd({
      tour_id: tour.id,
      tour_name: tour.title,
      destination: tour.destination,
      duration: tour.duration_days,
      category: tour.category,
      price: tour.price_per_person,
      participants: participants
    });
  };

  return (
    <div className="space-y-4">
      {/* Selected Tours */}
      {selectedTours.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <h3 className="font-bold text-slate-900 mb-4">Selected Tours ({selectedTours.length})</h3>
            <div className="space-y-3">
              {selectedTours.map((tour, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{tour.tour_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-600">{tour.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-sm text-slate-600">{tour.duration} days</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {tour.participants} participant(s)
                    </p>
                    <p className="text-sm font-bold text-amber-600">
                      ${(tour.price * tour.participants).toLocaleString()}
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

      {/* Participants Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex-1">
            <label className="text-sm font-medium">Participants</label>
            <Select value={participants.toString()} onValueChange={(v) => setParticipants(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <SelectItem key={n} value={n.toString()}>{n} Participant{n > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Available Tours */}
      <div className="space-y-3">
        {isLoading ? (
          <Card><CardContent className="py-12 text-center">Loading tours...</CardContent></Card>
        ) : tours.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-slate-600">No tours available</CardContent></Card>
        ) : (
          tours.map(tour => (
            <Card key={tour.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{tour.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{tour.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">{tour.duration_days} days</span>
                    </div>
                    {tour.category && (
                      <Badge className="text-xs capitalize mb-2">
                        {tour.category.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {tour.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(Math.round(tour.rating))].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-xs text-slate-500 ml-1">
                          ({tour.reviews_count || 0})
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-slate-900">
                      ${tour.price_per_person}
                    </p>
                    <p className="text-xs text-slate-500 mb-3">per person</p>
                    <Button
                      size="sm"
                      onClick={() => handleAddTour(tour)}
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