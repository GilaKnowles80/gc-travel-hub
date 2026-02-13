import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane, Mail, Smartphone, Printer, Download, CheckCircle, Loader2, QrCode } from "lucide-react";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

export default function FlightTicket() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("id");
  const ticketRef = useRef(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sending, setSending] = useState(false);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["flight-booking", bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.FlightBooking.filter({ id: bookingId });
      return bookings[0];
    },
    enabled: !!bookingId
  });

  const { data: flight } = useQuery({
    queryKey: ["flight", booking?.flight_id],
    queryFn: async () => {
      const flights = await base44.entities.Flight.filter({ id: booking.flight_id });
      return flights[0];
    },
    enabled: !!booking?.flight_id
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`flight-ticket-${booking.flight_number}.pdf`);
      toast.success("Ticket downloaded successfully");
    } catch (error) {
      toast.error("Failed to download ticket");
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: booking.passenger_email,
        subject: `Your Flight Ticket - ${booking.flight_number}`,
        body: `
          <h2>Your Flight Ticket</h2>
          <p>Dear ${booking.passenger_name},</p>
          <p>Thank you for booking with GC Travel & Tours. Your flight details:</p>
          <ul>
            <li><strong>Flight:</strong> ${booking.flight_number}</li>
            <li><strong>Route:</strong> ${booking.route}</li>
            <li><strong>Departure:</strong> ${moment(flight?.departure_time).format("MMMM DD, YYYY HH:mm")}</li>
            <li><strong>Seats:</strong> ${booking.selected_seats?.join(", ")}</li>
            <li><strong>Booking Reference:</strong> ${booking.id}</li>
          </ul>
          <p>Please arrive at the airport at least 2 hours before departure.</p>
          <p>Safe travels!</p>
        `
      });
      toast.success("Ticket sent to your email");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }

    setSending(true);
    try {
      // Note: SMS functionality would require an SMS provider integration
      // For now, we'll show a success message
      toast.success(`Ticket details would be sent to ${phoneNumber}`);
      toast.info("SMS integration coming soon");
    } catch (error) {
      toast.error("Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-lg text-slate-600">Booking not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600">Your flight ticket is ready</p>
        </div>

        {/* E-Ticket */}
        <Card ref={ticketRef} className="p-8 mb-8 print:shadow-none">
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">GC Travel & Tours</span>
                </div>
                <p className="text-sm text-slate-600">E-Ticket</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Booking Reference</p>
                <p className="text-xl font-bold text-slate-900">{booking.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Flight Info */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-slate-500">From</p>
                  <p className="text-2xl font-bold">{flight?.origin}</p>
                  <p className="text-sm text-slate-600">{moment(flight?.departure_time).format("MMM DD, YYYY")}</p>
                  <p className="text-lg font-semibold">{moment(flight?.departure_time).format("HH:mm")}</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <Plane className="w-8 h-8 text-amber-500 rotate-90 mb-2" />
                  <p className="text-sm text-slate-500">{flight?.duration_hours}h</p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-slate-500">To</p>
                  <p className="text-2xl font-bold">{flight?.destination}</p>
                  <p className="text-sm text-slate-600">{moment(flight?.arrival_time).format("MMM DD, YYYY")}</p>
                  <p className="text-lg font-semibold">{moment(flight?.arrival_time).format("HH:mm")}</p>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Passenger Name</p>
                <p className="font-semibold text-slate-900">{booking.passenger_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Flight Number</p>
                <p className="font-semibold text-slate-900">{booking.flight_number}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Cabin Class</p>
                <p className="font-semibold text-slate-900 capitalize">{booking.cabin_class.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Seat{booking.selected_seats?.length > 1 ? 's' : ''}</p>
                <p className="font-semibold text-slate-900">{booking.selected_seats?.join(", ")}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Passengers</p>
                <p className="font-semibold text-slate-900">{booking.number_of_passengers}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Trip Type</p>
                <p className="font-semibold text-slate-900 capitalize">{booking.trip_type.replace(/_/g, " ")}</p>
              </div>
            </div>

            {/* Barcode Placeholder */}
            <div className="border-t border-slate-200 pt-6 flex justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                  <QrCode className="w-16 h-16 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">Scan at check-in</p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="border-t border-slate-200 mt-6 pt-6">
              <p className="text-xs text-slate-500 text-center">
                Please arrive at the airport at least 2 hours before departure. Valid photo ID required.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 print:hidden">
          <Button onClick={handleSendEmail} disabled={sending} className="bg-blue-500 hover:bg-blue-600">
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Send via Email
          </Button>
          
          <Button onClick={handleDownloadPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>

          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Ticket
          </Button>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+63 917 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendSMS} disabled={sending} variant="outline">
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500">Send ticket details via SMS</p>
          </div>
        </div>

        {/* Additional Info */}
        <Card className="p-6 print:hidden">
          <h3 className="font-semibold text-slate-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Check-in opens 3 hours before departure</li>
            <li>• Boarding closes 30 minutes before departure</li>
            <li>• Please bring a valid photo ID and this e-ticket</li>
            <li>• Check baggage allowance: {flight?.baggage_allowance || "23 kg checked, 7 kg cabin"}</li>
            <li>• Contact us for any changes: info@gctraveltours.com</li>
          </ul>
        </Card>
      </div>

      <style jsx>{`
        @media print {
          @page {
            margin: 20mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}