import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, Printer, Download, Mail, MessageSquare, AlertCircle } from "lucide-react";
import moment from "moment";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ItineraryReceipt({ booking, flight, onClose }) {
  const receiptRef = useRef(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSMSDialog, setShowSMSDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState(booking.passenger_email || "");
  const [phoneNumber, setPhoneNumber] = useState(booking.passenger_phone || "");
  const [sending, setSending] = useState(false);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add pages if content is longer than one page
      let position = 0;
      const pageHeight = 295;
      
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      
      if (imgHeight > pageHeight) {
        let heightLeft = imgHeight - pageHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`itinerary-${booking.id.substring(0, 8)}.pdf`);
      toast.success("Itinerary downloaded successfully");
    } catch (error) {
      toast.error("Failed to download itinerary");
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: emailAddress,
        subject: `Flight Itinerary - ${booking.passenger_name}`,
        body: `
          <h2>Your Flight Itinerary</h2>
          <p>Dear ${booking.passenger_name},</p>
          <p>Thank you for booking with GC Travel & Tours. Here are your flight details:</p>
          <ul>
            <li><strong>PNR:</strong> ${booking.id.substring(0, 8).toUpperCase()}</li>
            <li><strong>Flight:</strong> ${flight?.flight_number}</li>
            <li><strong>Route:</strong> ${flight?.origin} to ${flight?.destination}</li>
            <li><strong>Departure:</strong> ${moment(flight?.departure_time).format("MMM DD, YYYY HH:mm")}</li>
            <li><strong>Class:</strong> ${booking.cabin_class}</li>
          </ul>
          <p>Please arrive at the airport at least 2 hours before departure for domestic flights.</p>
          <p>For full itinerary details, please login to your account.</p>
          <br>
          <p>Safe travels!</p>
          <p><strong>GC Travel & Tours</strong></p>
          <p>+63 915 440 1150 | gctravelandtours2021@gmail.com</p>
        `
      });
      toast.success("Itinerary sent to email successfully!");
      setShowEmailDialog(false);
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

    toast.info("SMS feature coming soon! For now, please use email or download PDF.");
    setShowSMSDialog(false);
  };

  return (
    <div className="space-y-6 px-2 md:px-0">
      <div ref={receiptRef} className="bg-white">
        {/* Page 1: Flight Details */}
        <Card className="p-4 md:p-8 mb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b-2">
            <div>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/86d6f4c8e_L7.jpg"
                alt="GC Travel and Tours Agency"
                className="h-24 w-24 object-contain mb-2"
              />
              <h2 className="text-2xl font-bold text-slate-900">Air Ticket</h2>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-600">Issued: {moment().format("MMM DD, YYYY [at] HH:mm")}</p>
              <p className="text-sm text-slate-600">PNR: <span className="font-bold">{booking.id.substring(0, 8).toUpperCase()}</span></p>
            </div>
          </div>

          {/* Agent Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-6 border-b">
            <div>
              <h3 className="font-bold text-slate-900 mb-3">AGENT DETAILS</h3>
              <p className="text-sm"><strong>GC TRAVEL AND TOURS SERVICES</strong></p>
              <p className="text-sm">CALOC, AN MAGALLANES</p>
              <p className="text-sm">AGUSAN DEL NORTE</p>
              <p className="text-sm">PHILIPPINES</p>
              <p className="text-sm mt-2"><strong>09154401150</strong></p>
              <p className="text-sm text-blue-600">gilaknowles8@gmail.com</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm mb-1">Issued by: <strong>Philippine Airlines PR</strong></p>
              <p className="text-sm">Ninoy Aquino International Airport-Pasay City,</p>
              <p className="text-sm">Philippines (632) 879-5601 Fax: (632) 879-5637</p>
              <p className="text-sm"><strong>Airline PNR: {flight?.flight_number || 'TBD'}</strong></p>
              <p className="text-sm">Office Hours: Daily: 2:00 a.m. - 10:00 p.m.</p>
              <p className="text-sm">Phone:(632) 855-8888 .</p>
              <p className="text-sm text-blue-600">EMail:webpr@pal.com.ph</p>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold text-slate-900 mb-3">PASSENGER DETAILS</h3>
            <div className="bg-slate-50 p-4 rounded-lg overflow-x-auto">
              <table className="w-full text-xs md:text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-2">PASSENGER NAME</th>
                    <th className="text-left py-2">TICKET NO</th>
                    <th className="text-right py-2">BASIC FARE</th>
                    <th className="text-right py-2">TAX & OTHERS</th>
                    <th className="text-right py-2">GROSS AMOUNT</th>
                    <th className="text-center py-2">PAX TYPE</th>
                    <th className="text-center py-2">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">{booking.passenger_name}</td>
                    <td className="py-2">{booking.id.substring(0, 12)}</td>
                    <td className="text-right py-2">₱{(booking.total_price * 0.57).toFixed(2)}</td>
                    <td className="text-right py-2">₱{(booking.total_price * 0.43).toFixed(2)}</td>
                    <td className="text-right py-2">₱{booking.total_price.toFixed(2)}</td>
                    <td className="text-center py-2">Adult</td>
                    <td className="text-center py-2 text-green-600 font-semibold">CONFIRM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Flight Details */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="font-bold text-slate-900 mb-3">FLIGHT DETAILS</h3>
            <div className="bg-slate-50 p-4 rounded-lg mb-4 overflow-x-auto">
              <div className="grid grid-cols-6 gap-2 md:gap-4 text-xs md:text-sm font-semibold border-b border-slate-300 pb-2 mb-2 min-w-[600px]">
                <div>ORIGIN</div>
                <div>DESTINATION</div>
                <div>FLIGHT NO</div>
                <div>CLASS</div>
                <div>DEP DATE & TIME</div>
                <div>ARR DATE & TIME</div>
              </div>
              <div className="grid grid-cols-6 gap-2 md:gap-4 text-xs md:text-sm min-w-[600px]">
                <div>DVO<br/>{flight?.origin}</div>
                <div>MNL<br/>{flight?.destination}</div>
                <div>{flight?.flight_number}<br/>T</div>
                <div>{booking.cabin_class[0]}</div>
                <div>{moment(flight?.departure_time).format("MM/DD/YYYY HH:mm")}</div>
                <div>{moment(flight?.arrival_time).format("MM/DD/YYYY HH:mm")}</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm">
                <div>
                  <p className="font-semibold">TICKET NO</p>
                  <p>{booking.id.substring(0, 14)}</p>
                </div>
                <div>
                  <p className="font-semibold">SPECIAL REQUEST</p>
                  <p>-</p>
                </div>
                <div>
                  <p className="font-semibold">FREQUENT FLYER</p>
                  <p>-</p>
                </div>
                <div>
                  <p className="font-semibold">PREFERENCE</p>
                  <p>-</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fare Details */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 mb-3">FARE DETAILS</h3>
            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
              <div className="flex justify-between"><span>Basic Fare (PHP)</span><span>₱{(booking.total_price * 0.57).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Equivalent Fare (PHP)</span><span>₱{(booking.total_price * 0.57).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax & Others(PHP)</span><span>₱{(booking.total_price * 0.43).toFixed(2)}</span></div>
              <div className="border-t border-slate-300 pt-2 mt-2">
                <div className="flex justify-between"><span>VAT Exempt (PHP)</span><span>0.00</span></div>
                <div className="flex justify-between"><span>AIG Insurance Fee (PHP)</span><span>0.00</span></div>
                <div className="flex justify-between font-bold text-base"><span>Gross Fare(PHP)</span><span>₱{booking.total_price.toFixed(2)}</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2">Taxes & Others : LI - 200.00 , PD2 - 15.00 , PV - 373.00 , YQF - 318.00 , YRI - 450.00</p>
          </div>
        </Card>

        {/* Page 2: Important Information */}
        <Card className="p-4 md:p-8">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            IMPORTANT INFORMATION
          </h3>

          <div className="space-y-6 text-sm text-slate-700">
            <div>
              <p className="font-semibold mb-2">1) All Passengers</p>
              <p>Must provide valid identification ID / Passport upon check-in For Infants valid birth certificate is required.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">2) Ensure that your first name and last name</p>
              <p>As mentioned in your passport or Government issued ID, of your flight or airline reservation. If you present an ID or passport with a name that is different from the name reflected in the ID presented.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">3) Be at the Airport / counters on time</p>
              <p>Airline counters closes generally at 45 minutes prior to the scheduled departure time. International flight counters closes generally at 2 hours prior to the scheduled departure time.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">Domestic Flight - Check-in counters open two (2) hours before the scheduled flight departure time.</p>
              <p><strong>International Flight</strong> - Check-in starts 3 hours before your scheduled departure. However, you are advised to check with the Airport or Airline before you go.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">4) Each passenger (except infants not occupying an aircraft seat)</p>
              <p>Is permitted 1 item of Cabin Baggage and 1 other small item (e.g. ladies' handbag, small suit case or laptop computer). Dimensions of the main item must not exceed 56cm (width) + 36cm (height) + 23cm (depth) or 22" x 14" x 9". Both items should be light enough to allow you to lift them to overhead lockers.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">5) Ticket amendment is subject to availability</p>
              <p>And/or any change fees and/or fare difference charged by the Airline, and circumstances are beyond BiyaheKo control and Airline may offer rebooking or refund tickets depending on the Airline procedure and policies.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">6) Carriage and other services</p>
              <p>Provided by the carrier are subject to conditions of the flight carrier, which are hereby incorporated by reference. These conditions may be obtained from the carrier.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">7) As dictated by your airline</p>
              <p>There may be a maximum number of infants per flight or per cabin segment and only 1 infant per adult on each flight and some important notices.</p>
            </div>

            <div>
              <p className="font-semibold mb-2">8) For International flights</p>
              <p>If the passenger journey involves an ultimate destination or stop in a country other than the country of departure, the Warsaw Convention may be applicable and in most case, limits the liability of carriers in case of death or injury and for loss of or damage to baggage. See also notice headed "Advice to International Passengers on Limitation of Liability".</p>
            </div>

            <div>
              <p className="font-semibold mb-2">9)For International Flights</p>
              <p>Visas, permits, and documents required differ depending on your destination. Note that you are responsible for obtaining and holding all required travel documents and visas. Always ensure that you have these documents with you for presentation during your flight.</p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200 mt-6">
              <h4 className="font-bold text-slate-900 mb-3">DO'S AND DON'TS AT THE AIRPORT</h4>
              
              <div className="mb-4">
                <p className="font-semibold text-green-700 mb-2">DO's:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Arrive at least 2 hours before domestic flights, 3 hours before international flights</li>
                  <li>Bring valid government-issued ID and printed/digital boarding pass</li>
                  <li>Check baggage allowance and pack accordingly</li>
                  <li>Keep valuables, electronics, and medications in carry-on luggage</li>
                  <li>Follow security protocols and cooperate with airport staff</li>
                  <li>Stay hydrated and comfortable during wait times</li>
                  <li>Monitor flight status for any updates or gate changes</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold text-red-700 mb-2">DON'Ts:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Don't joke about security threats or bombs - it's a criminal offense</li>
                  <li>Don't pack prohibited items (sharp objects, flammable liquids, weapons)</li>
                  <li>Don't leave luggage unattended - it may be confiscated or destroyed</li>
                  <li>Don't accept packages from strangers or carry items for others</li>
                  <li>Don't overpack carry-on luggage beyond airline limits</li>
                  <li>Don't be intoxicated or disruptive at the airport or on the flight</li>
                  <li>Don't forget to declare items that require customs declaration</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
              <h4 className="font-bold text-slate-900 mb-2">CONTACT INFORMATION</h4>
              <p>For any assistance or inquiries:</p>
              <p className="mt-2"><strong>GC Travel and Tours</strong></p>
              <p>Phone: +63 915 440 1150</p>
              <p>Email: gctravelandtours2021@gmail.com</p>
              <p className="mt-2 text-xs">Available 24/7 for emergency travel assistance</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end print:hidden">
        <Button onClick={() => setShowEmailDialog(true)} variant="outline" className="w-full sm:w-auto">
          <Mail className="w-4 h-4 mr-2" />
          Send via Email
        </Button>
        <Button onClick={() => setShowSMSDialog(true)} variant="outline" className="w-full sm:w-auto">
          <MessageSquare className="w-4 h-4 mr-2" />
          Send via SMS
        </Button>
        <Button onClick={handleDownloadPDF} variant="outline" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="w-full sm:w-auto">
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
        <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
          Close
        </Button>
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Itinerary via Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="passenger@example.com"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={sending} className="bg-amber-600 hover:bg-amber-700">
                {sending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SMS Dialog */}
      <Dialog open={showSMSDialog} onOpenChange={setShowSMSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Itinerary via SMS</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+63 XXX XXX XXXX"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSMSDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendSMS} className="bg-amber-600 hover:bg-amber-700">
                Send SMS
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}