import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmailClients() {
  const [user, setUser] = useState(null);
  const [toEmail, setToEmail] = useState("");
  const [fromName, setFromName] = useState("GC Travel & Tours");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  // Fetch all bookings to get client emails
  const { data: tourBookings = [] } = useQuery({
    queryKey: ['tour-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 100),
    enabled: user?.role === 'admin'
  });

  const { data: flightBookings = [] } = useQuery({
    queryKey: ['flight-bookings'],
    queryFn: () => base44.entities.FlightBooking.list('-created_date', 100),
    enabled: user?.role === 'admin'
  });

  const { data: hotelBookings = [] } = useQuery({
    queryKey: ['hotel-bookings'],
    queryFn: () => base44.entities.HotelBooking.list('-created_date', 100),
    enabled: user?.role === 'admin'
  });

  // Combine all bookings
  const allBookings = [
    ...tourBookings.map(b => ({ ...b, type: 'Tour', email: b.customer_email, name: b.customer_name, reference: b.tour_title })),
    ...flightBookings.map(b => ({ ...b, type: 'Flight', email: b.passenger_email, name: b.passenger_name, reference: b.route })),
    ...hotelBookings.map(b => ({ ...b, type: 'Hotel', email: b.guest_email, name: b.guest_name, reference: b.hotel_name }))
  ];

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData) => {
      return await base44.integrations.Core.SendEmail(emailData);
    },
    onSuccess: () => {
      toast.success("Email sent successfully!");
      setToEmail("");
      setSubject("");
      setBody("");
      setSelectedBooking("");
    },
    onError: (error) => {
      toast.error(`Failed to send email: ${error.message}`);
    }
  });

  const handleBookingSelect = (bookingId) => {
    setSelectedBooking(bookingId);
    const booking = allBookings.find(b => b.id === bookingId);
    if (booking) {
      setToEmail(booking.email);
      setSubject(`Your ${booking.type} Booking - ${booking.reference}`);
      
      // Generate itinerary email template
      const itinerary = `
Dear ${booking.name},

Thank you for booking with GC Travel & Tours!

Booking Details:
- Type: ${booking.type}
- Reference: ${booking.reference}
- Status: ${booking.status}
- Total: ₱${booking.total_price?.toLocaleString() || 'N/A'}

${booking.type === 'Tour' ? `
Departure Date: ${booking.departure_date || 'TBD'}
Number of Travelers: ${booking.number_of_travelers}
` : ''}

${booking.type === 'Flight' ? `
Route: ${booking.route}
Cabin Class: ${booking.cabin_class}
Number of Passengers: ${booking.number_of_passengers}
` : ''}

${booking.type === 'Hotel' ? `
Hotel: ${booking.hotel_name}
Check-in: ${booking.check_in_date}
Check-out: ${booking.check_out_date}
Rooms: ${booking.number_of_rooms}
` : ''}

For any questions, please contact us at:
📧 info@gctraveltours.com
📱 +63 915 440 1150

Safe travels!
GC Travel & Tours Team
      `.trim();
      
      setBody(itinerary);
    }
  };

  const handleSendEmail = () => {
    if (!toEmail || !subject || !body) {
      toast.error("Please fill in all fields");
      return;
    }

    sendEmailMutation.mutate({
      from_name: fromName,
      to: toEmail,
      subject: subject,
      body: body
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Mail className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-slate-900">Send Email to Clients</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Select Booking */}
            <div className="space-y-2">
              <Label>Select Booking (Optional)</Label>
              <Select value={selectedBooking} onValueChange={handleBookingSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a booking to auto-fill details..." />
                </SelectTrigger>
                <SelectContent>
                  {allBookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.type} - {booking.name} ({booking.reference})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Name */}
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="GC Travel & Tours"
              />
            </div>

            {/* To Email */}
            <div className="space-y-2">
              <Label>To Email *</Label>
              <Input
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your Travel Itinerary"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label>Message *</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email message here..."
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendEmail}
              disabled={sendEmailMutation.isPending}
              className="w-full bg-amber-600 hover:bg-amber-700"
              size="lg"
            >
              {sendEmailMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}