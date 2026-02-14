import React from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-amber-500" />
            Terms of Service
          </h1>
          <p className="text-slate-600">Last updated: February 14, 2026</p>
        </div>

        <Card className="p-8 border-0 shadow-sm">
          <div className="prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using GC Travel & Tours services, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Booking and Reservations</h2>
            <p>
              All bookings made through our platform are subject to availability and confirmation. We reserve the right to cancel or modify bookings in exceptional circumstances.
            </p>
            <ul>
              <li>Flight bookings are confirmed upon successful payment</li>
              <li>Hotel reservations are subject to property availability</li>
              <li>Tour packages require minimum participant numbers</li>
            </ul>

            <h2>3. Payment Terms</h2>
            <p>
              All payments must be made in full at the time of booking unless otherwise specified. We accept major credit cards and digital payment methods through our secure payment gateway.
            </p>

            <h2>4. Cancellation and Refunds</h2>
            <p>
              Cancellation policies vary depending on the type of service booked. Please refer to our Refund Policy for detailed information.
            </p>

            <h2>5. Travel Documents</h2>
            <p>
              Travelers are responsible for ensuring they have valid passports, visas, and other required travel documents. GC Travel & Tours is not liable for denial of entry due to invalid documentation.
            </p>

            <h2>6. Liability</h2>
            <p>
              GC Travel & Tours acts as an intermediary between travelers and service providers. We are not liable for delays, cancellations, or changes made by airlines, hotels, or tour operators.
            </p>

            <h2>7. Customer Conduct</h2>
            <p>
              Customers are expected to conduct themselves appropriately during their travel. Inappropriate behavior may result in termination of services without refund.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>

            <h2>9. Contact Information</h2>
             <p>
               For questions about these Terms of Service, please contact us at:
               <br />
               Email: info@gctravelandtours.com
               <br />
               Phone: +639154401150
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
}