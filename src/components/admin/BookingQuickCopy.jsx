import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function BookingQuickCopy({ booking, type }) {
  const [copied, setCopied] = React.useState(false);

  const formatBookingDetails = () => {
    switch (type) {
      case 'flight':
        return `Passenger: ${booking.passenger_name}
Email: ${booking.passenger_email}
Phone: ${booking.passenger_phone}
Route: ${booking.route}
Flight: ${booking.flight_number}
Class: ${booking.cabin_class}
Passengers: ${booking.number_of_passengers}
Price: ${booking.total_price}
Passport: ${booking.passport_number || 'N/A'}
DOB: ${booking.date_of_birth || 'N/A'}
Special: ${booking.special_requests || 'None'}`;

      case 'hotel':
        return `Guest: ${booking.guest_name}
Email: ${booking.guest_email}
Phone: ${booking.guest_phone}
Hotel: ${booking.hotel_name}
Room: ${booking.room_type}
Check-in: ${booking.check_in_date}
Check-out: ${booking.check_out_date}
Rooms: ${booking.number_of_rooms}
Guests: ${booking.number_of_guests}
Price: ${booking.total_price}
Special: ${booking.special_requests || 'None'}`;

      case 'ferry':
        return `Passenger: ${booking.passenger_name}
Email: ${booking.passenger_email}
Phone: ${booking.passenger_phone}
Route: ${booking.route}
Company: ${booking.ferry_company || 'TBD'}
Date: ${booking.departure_date}
Time: ${booking.departure_time || 'TBD'}
Type: ${booking.accommodation_type}
Passengers: ${booking.number_of_passengers}
Price: ${booking.total_price}
Special: ${booking.special_requests || 'None'}`;

      case 'bus':
        return `Passenger: ${booking.passenger_name}
Email: ${booking.passenger_email}
Phone: ${booking.passenger_phone}
Route: ${booking.route}
Company: ${booking.bus_company || 'TBD'}
Date: ${booking.departure_date}
Time: ${booking.departure_time || 'TBD'}
Seat Type: ${booking.seat_type}
Passengers: ${booking.number_of_passengers}
Price: ${booking.total_price}
Special: ${booking.special_requests || 'None'}`;

      case 'car':
        return `Driver: ${booking.driver_name}
Email: ${booking.driver_email}
Phone: ${booking.driver_phone}
License: ${booking.driver_license || 'N/A'}
Car Type: ${booking.car_type}
Pickup: ${booking.pickup_location}
Dropoff: ${booking.dropoff_location}
Pickup Date/Time: ${booking.pickup_date} ${booking.pickup_time || ''}
Dropoff Date/Time: ${booking.dropoff_date} ${booking.dropoff_time || ''}
With Driver: ${booking.with_driver ? 'Yes' : 'No'}
Price: ${booking.total_price}
Special: ${booking.special_requests || 'None'}`;

      default:
        return JSON.stringify(booking, null, 2);
    }
  };

  const handleCopy = async () => {
    const details = formatBookingDetails();
    await navigator.clipboard.writeText(details);
    setCopied(true);
    toast.success("Booking details copied! Paste into supplier portal.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={handleCopy}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Quick Copy
        </>
      )}
    </Button>
  );
}