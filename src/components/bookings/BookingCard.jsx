import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Users, CreditCard, Plane, Compass, Hotel, Ship, Bus, Umbrella, Zap, Car } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
};

const paymentColors = {
  unpaid: "bg-orange-100 text-orange-800 border-orange-200",
  partial: "bg-amber-100 text-amber-800 border-amber-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-slate-100 text-slate-800 border-slate-200",
};

const bookingIcons = {
  flight: Plane,
  tour: Compass,
  hotel: Hotel,
  ferry: Ship,
  bus: Bus,
  insurance: Umbrella,
  visa: Zap,
  car_rental: Car,
};

export default function BookingCard({ booking, index, type }) {
  const Icon = bookingIcons[type] || Compass;
  let title = "";
  let details = [];
  let date = "";

  switch (type) {
    case "flight":
      title = `${booking.route} - ${booking.flight_number}`;
      date = booking.departure_time ? new Date(booking.departure_time).toLocaleDateString() : "TBD";
      details = [
        { icon: Plane, label: booking.cabin_class },
        { icon: Users, label: `${booking.number_of_passengers || 1} passenger${booking.number_of_passengers > 1 ? "s" : ""}` },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
    case "tour":
      title = booking.tour_title;
      date = booking.departure_date ? new Date(booking.departure_date).toLocaleDateString() : "TBD";
      details = [
        { icon: MapPin, label: booking.destination },
        { icon: Users, label: `${booking.number_of_travelers} traveler${booking.number_of_travelers > 1 ? "s" : ""}` },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
    case "hotel":
      title = booking.hotel_name;
      date = new Date(booking.check_in_date).toLocaleDateString();
      details = [
        { icon: MapPin, label: booking.room_type },
        { icon: Users, label: `${booking.number_of_guests || 1} guest${booking.number_of_guests > 1 ? "s" : ""}` },
        { icon: Calendar, label: `${booking.number_of_rooms} room${booking.number_of_rooms > 1 ? "s" : ""}` },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
    case "ferry":
      title = booking.route;
      date = new Date(booking.departure_date).toLocaleDateString();
      details = [
        { icon: Ship, label: booking.accommodation_type },
        { icon: Users, label: `${booking.number_of_passengers} passenger${booking.number_of_passengers > 1 ? "s" : ""}` },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
    case "bus":
      title = booking.route;
      date = new Date(booking.departure_date).toLocaleDateString();
      details = [
        { icon: Bus, label: booking.seat_type },
        { icon: Users, label: `${booking.number_of_passengers} passenger${booking.number_of_passengers > 1 ? "s" : ""}` },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
    case "insurance":
      title = "Travel Insurance";
      details = [
        { icon: Calendar, label: booking.trip_duration ? `${booking.trip_duration} days` : "N/A" },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
    case "visa":
      title = `${booking.country} - ${booking.visa_type} Visa`;
      details = [
        { icon: Users, label: `${booking.number_of_applicants || 1} applicant${booking.number_of_applicants > 1 ? "s" : ""}` },
        { icon: Calendar, label: `${booking.processing_time_days} days processing` },
        { icon: CreditCard, label: `₱${booking.price?.toLocaleString()}` },
      ];
      break;
    case "car_rental":
      title = `${booking.car_type} - ${booking.pickup_location}`;
      date = new Date(booking.pickup_date).toLocaleDateString();
      details = [
        { icon: Users, label: `${booking.number_of_passengers || 1} passenger${booking.number_of_passengers > 1 ? "s" : ""}` },
        { icon: Calendar, label: `${new Date(booking.dropoff_date).toLocaleDateString()}` },
        { icon: CreditCard, label: `₱${booking.total_price?.toLocaleString()}` },
      ];
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 truncate">{title}</h3>
              <p className="text-sm text-slate-500 mt-1">Ref: {booking.id}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
                {date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    {date}
                  </div>
                )}
                {details.map((detail, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <detail.icon className="w-4 h-4 flex-shrink-0" />
                    {detail.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Badge className={`${statusColors[booking.status] || statusColors.pending} border capitalize text-xs`}>
              {booking.status || "pending"}
            </Badge>
            {booking.payment_status && (
              <Badge className={`${paymentColors[booking.payment_status] || paymentColors.unpaid} border capitalize text-xs`}>
                {booking.payment_status}
              </Badge>
            )}
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 border capitalize text-xs">
              {type.replace("_", " ")}
            </Badge>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}