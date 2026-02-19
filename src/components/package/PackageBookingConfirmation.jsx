import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plane, Hotel, MapPin, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/pages/utils';
import moment from 'moment';

export default function PackageBookingConfirmation({ packageBooking, payment }) {
  const navigate = useNavigate();

  const handleDownloadReceipt = () => {
    const receiptContent = `
GC TRAVEL & TOURS AGENCY
Package Booking Receipt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking Reference: ${packageBooking.id}
Package Name: ${packageBooking.package_name}
Booking Date: ${moment(packageBooking.created_date).format('MMMM DD, YYYY')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PACKAGE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${packageBooking.flights?.length > 0 ? `✈️ FLIGHTS (${packageBooking.flights.length})
${packageBooking.flights.map((f, i) => `
${i + 1}. ${f.origin} → ${f.destination}
   ${f.airline} ${f.flight_number}
   Class: ${f.cabin_class}
   Passengers: ${f.passengers}
   Price: $${(f.price * f.passengers).toLocaleString()}`).join('\n')}
` : ''}
${packageBooking.hotels?.length > 0 ? `
🏨 HOTELS (${packageBooking.hotels.length})
${packageBooking.hotels.map((h, i) => `
${i + 1}. ${h.hotel_name}
   Location: ${h.location}
   Nights: ${h.nights}
   Rooms: ${h.rooms}
   Price: $${(h.price * h.nights * h.rooms).toLocaleString()}`).join('\n')}
` : ''}
${packageBooking.tours?.length > 0 ? `
🗺️ TOURS (${packageBooking.tours.length})
${packageBooking.tours.map((t, i) => `
${i + 1}. ${t.tour_name}
   Destination: ${t.destination}
   Duration: ${t.duration} days
   Participants: ${t.participants}
   Price: $${(t.price * t.participants).toLocaleString()}`).join('\n')}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Subtotal: $${packageBooking.total_price?.toLocaleString()}
${packageBooking.discount_percentage > 0 ? `Discount (${packageBooking.discount_percentage}%): -$${((packageBooking.total_price * packageBooking.discount_percentage) / 100).toLocaleString()}` : ''}
Total Paid: $${packageBooking.final_price?.toLocaleString()}

Payment Method: ${payment?.payment_method || 'Card'}
Transaction ID: ${payment?.id || 'N/A'}
Status: CONFIRMED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for booking with GC Travel & Tours!
For inquiries: info@gctravelandtours.com
Phone: +63 915 440 1150

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Package-Receipt-${packageBooking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-slate-600 text-lg">
            Your custom travel package has been successfully booked
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md mt-4">
            <span className="text-sm text-slate-600">Booking Reference:</span>
            <Badge className="bg-green-600 text-white">{packageBooking.id}</Badge>
          </div>
        </div>

        {/* Package Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{packageBooking.package_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Flights */}
            {packageBooking.flights?.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Flights ({packageBooking.flights.length})
                </h3>
                <div className="space-y-3">
                  {packageBooking.flights.map((flight, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{flight.origin} → {flight.destination}</p>
                          <p className="text-sm text-slate-600">{flight.airline} {flight.flight_number}</p>
                          <p className="text-sm text-slate-600">{flight.cabin_class} • {flight.passengers} passenger(s)</p>
                        </div>
                        <p className="font-bold text-blue-600">${(flight.price * flight.passengers).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hotels */}
            {packageBooking.hotels?.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                  <Hotel className="w-5 h-5 text-purple-600" />
                  Hotels ({packageBooking.hotels.length})
                </h3>
                <div className="space-y-3">
                  {packageBooking.hotels.map((hotel, idx) => (
                    <div key={idx} className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{hotel.hotel_name}</p>
                          <p className="text-sm text-slate-600">{hotel.location}</p>
                          <p className="text-sm text-slate-600">{hotel.nights} night(s) • {hotel.rooms} room(s)</p>
                        </div>
                        <p className="font-bold text-purple-600">${(hotel.price * hotel.nights * hotel.rooms).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tours */}
            {packageBooking.tours?.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Tours ({packageBooking.tours.length})
                </h3>
                <div className="space-y-3">
                  {packageBooking.tours.map((tour, idx) => (
                    <div key={idx} className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{tour.tour_name}</p>
                          <p className="text-sm text-slate-600">{tour.destination}</p>
                          <p className="text-sm text-slate-600">{tour.duration} days • {tour.participants} participant(s)</p>
                        </div>
                        <p className="font-bold text-green-600">${(tour.price * tour.participants).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="pt-4 border-t-2">
              <div className="bg-slate-50 p-6 rounded-lg">
                <div className="flex justify-between mb-2 text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-medium">${packageBooking.total_price?.toLocaleString()}</span>
                </div>
                {packageBooking.discount_percentage > 0 && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span>Package Discount ({packageBooking.discount_percentage}%)</span>
                    <span className="font-bold">-${((packageBooking.total_price * packageBooking.discount_percentage) / 100).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-slate-900 pt-2 border-t">
                  <span>Total Paid</span>
                  <span className="text-green-600">${packageBooking.final_price?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Button
            onClick={handleDownloadReceipt}
            className="flex-1 bg-slate-600 hover:bg-slate-700 h-12"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
          <Button
            onClick={() => navigate(createPageUrl('MyPackages'))}
            className="flex-1 bg-green-600 hover:bg-green-700 h-12"
          >
            View My Packages
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              What's Next?
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✅ Confirmation email sent to your inbox</li>
              <li>✅ Package details saved to your account</li>
              <li>📧 You'll receive booking vouchers for each component within 24 hours</li>
              <li>📱 Check your email for travel documents and important information</li>
              <li>💬 Our team will contact you if any additional details are needed</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}