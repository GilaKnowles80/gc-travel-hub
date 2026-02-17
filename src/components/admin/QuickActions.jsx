import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Hotel as HotelIcon, MapPin, FileText, Ship, Bus as BusIcon, Car, Shield, Plus } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    { title: 'Add Flight', icon: Plane, page: 'AdminFlights', color: 'blue' },
    { title: 'Add Hotel', icon: HotelIcon, page: 'AdminHotels', color: 'green' },
    { title: 'Add Tour', icon: MapPin, page: 'AdminTours', color: 'amber' },
    { title: 'Add Visa', icon: FileText, page: 'AdminVisas', color: 'purple' },
    { title: 'Add Ferry', icon: Ship, page: 'AdminFerries', color: 'cyan' },
    { title: 'Add Bus', icon: BusIcon, page: 'AdminBuses', color: 'orange' },
    { title: 'Add Car', icon: Car, page: 'AdminCarRentals', color: 'red' },
    { title: 'Add Insurance', icon: Shield, page: 'AdminInsurance', color: 'indigo' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, idx) => (
            <Link key={idx} to={createPageUrl(action.page)}>
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                <action.icon className={`w-6 h-6 text-${action.color}-600`} />
                <span className="text-xs">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}