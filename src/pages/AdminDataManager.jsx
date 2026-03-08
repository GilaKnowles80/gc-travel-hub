import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Database, RefreshCw, FileJson, FileSpreadsheet, Plane, Hotel as HotelIcon, FileText, Ship, Bus as BusIcon, Car, Shield, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import UnifiedBookingsTable from '@/components/admin/UnifiedBookingsTable';

export default function AdminDataManager() {
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings');

  const dataTypes = [
    { id: 'flights', label: 'Flights', icon: Plane, entity: 'Flight', color: 'blue' },
    { id: 'hotels', label: 'Hotels', icon: HotelIcon, entity: 'Hotel', color: 'green' },
    { id: 'tours', label: 'Tours', icon: FileText, entity: 'Tour', color: 'amber' },
    { id: 'visas', label: 'Visas', icon: FileText, entity: 'Visa', color: 'purple' },
    { id: 'ferry', label: 'Ferry', icon: Ship, entity: 'FerryBooking', color: 'cyan' },
    { id: 'bus', label: 'Bus', icon: BusIcon, entity: 'BusBooking', color: 'orange' },
    { id: 'car', label: 'Car Rental', icon: Car, entity: 'CarRentalBooking', color: 'red' },
    { id: 'insurance', label: 'Insurance', icon: Shield, entity: 'TravelInsurance', color: 'indigo' }
  ];

  const handleFileImport = async (file, dataType) => {
    setImporting(true);
    try {
      const { data: uploadData } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.functions.invoke('importTravelData', {
        fileUrl: uploadData.file_url,
        dataType: dataType
      });

      toast.success(`${dataType} data imported successfully!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (dataType) => {
    try {
      const { data } = await base44.functions.invoke('exportTravelData', { dataType });
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const downloadTemplate = (dataType) => {
    const templates = {
      flights: {
        airline_name: "Philippine Airlines",
        flight_number: "PR123",
        origin: "Manila (MNL)",
        destination: "Cebu (CEB)",
        departure_time: "2026-03-15T08:00:00",
        arrival_time: "2026-03-15T09:30:00",
        duration_hours: 1.5,
        cabin_classes: [
          { class: "economy", price: 2500, seats_available: 150 },
          { class: "business", price: 8500, seats_available: 20 }
        ],
        status: "active"
      },
      hotels: {
        name: "Shangri-La at The Fort",
        location: "Manila, Philippines",
        star_rating: 5,
        description: "Luxury hotel in BGC",
        room_types: [
          { type: "Deluxe Room", price_per_night: 8500, capacity: 2 }
        ],
        status: "active"
      },
      insurance: {
        insurance_name: "Travel Safe Basic",
        provider: "Pacific Cross",
        coverage_type: "basic",
        coverage_amount: 50000,
        price_per_day: 150,
        coverage_details: ["Medical expenses", "Trip cancellation"],
        status: "active"
      }
    };

    const template = templates[dataType] || { note: "Add your data here" };
    const blob = new Blob([JSON.stringify([template], null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataType}_template.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Travel Data Manager</h1>
          <p className="text-slate-600">Import, export, and manage all travel inventory data</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 lg:grid-cols-9 mb-6">
            <TabsTrigger value="bookings">
              <BookOpen className="w-4 h-4 mr-2" />
              Bookings
            </TabsTrigger>
            {dataTypes.map(type => (
              <TabsTrigger key={type.id} value={type.id}>
                <type.icon className="w-4 h-4 mr-2" />
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  All Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UnifiedBookingsTable />
              </CardContent>
            </Card>
          </TabsContent>

          {dataTypes.map(type => (
            <TabsContent key={type.id} value={type.id}>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Import Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      Import Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Upload CSV, Excel, or JSON files to bulk import {type.label.toLowerCase()} data
                    </p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleFileImport(e.target.files[0], type.id);
                        }
                      }}
                      disabled={importing}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => downloadTemplate(type.id)}
                    >
                      <FileJson className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  </CardContent>
                </Card>

                {/* Export Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-green-600" />
                      Export Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Download all {type.label.toLowerCase()} data for backup or analysis
                    </p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleExport(type.id)}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`/admin-${type.id}`, '_self')}
                    >
                      <Database className="w-4 h-4 mr-2" />
                      View in Database
                    </Button>
                  </CardContent>
                </Card>

                {/* API Sync Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-amber-600" />
                      Real-time Sync
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Connect to live booking APIs for real-time {type.label.toLowerCase()} data
                    </p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="w-full justify-start">
                        Amadeus API: Connected
                      </Badge>
                      <Badge variant="outline" className="w-full justify-start">
                        Biyaheko: Ready
                      </Badge>
                      <Badge variant="outline" className="w-full justify-start">
                        Wanderlinx: Ready
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => toast.info('API sync coming soon')}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Configure APIs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}