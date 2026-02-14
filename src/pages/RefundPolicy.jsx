import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Card } from "@/components/ui/card";
import { DollarSign, ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-amber-500" />
            Refund & Cancellation Policy
          </h1>
          <p className="text-slate-600">Last updated: February 14, 2026</p>
        </div>

        <Card className="p-8 border-0 shadow-sm">
          <div className="prose prose-slate max-w-none">
            <h2>Flight Bookings</h2>
            
            <h3>Cancellation by Customer</h3>
            <ul>
              <li><strong>More than 7 days before departure:</strong> 80% refund (20% cancellation fee)</li>
              <li><strong>3-7 days before departure:</strong> 50% refund</li>
              <li><strong>Less than 3 days before departure:</strong> No refund</li>
              <li><strong>No-show:</strong> No refund</li>
            </ul>

            <h3>Flight Cancellation by Airline</h3>
            <p>
              If the airline cancels the flight, you are entitled to a full refund or rebooking on the next available flight at no additional cost.
            </p>

            <h2>Hotel Bookings</h2>
            
            <h3>Cancellation Policy</h3>
            <ul>
              <li><strong>More than 48 hours before check-in:</strong> Full refund</li>
              <li><strong>24-48 hours before check-in:</strong> 50% refund</li>
              <li><strong>Less than 24 hours before check-in:</strong> No refund</li>
            </ul>

            <h3>Modification Fees</h3>
            <p>
              Changes to hotel bookings are subject to availability and may incur a $25 modification fee plus any difference in rates.
            </p>

            <h2>Tour Packages</h2>
            
            <h3>Cancellation Terms</h3>
            <ul>
              <li><strong>More than 30 days before tour:</strong> 90% refund</li>
              <li><strong>15-30 days before tour:</strong> 50% refund</li>
              <li><strong>Less than 15 days before tour:</strong> No refund</li>
            </ul>

            <h3>Weather-Related Cancellations</h3>
            <p>
              If a tour is cancelled due to severe weather or safety concerns, you will receive a full refund or the option to reschedule.
            </p>

            <h2>Refund Processing</h2>
            
            <h3>Timeline</h3>
            <p>
              Approved refunds are processed within 7-10 business days. The refund will be credited to the original payment method used for booking.
            </p>

            <h3>Processing Fees</h3>
            <p>
              All refunds are subject to a $10 processing fee to cover administrative costs.
            </p>

            <h2>Special Circumstances</h2>
            
            <h3>Medical Emergencies</h3>
            <p>
              In case of documented medical emergencies, we may waive standard cancellation fees. Medical documentation must be provided within 48 hours of cancellation.
            </p>

            <h3>Force Majeure</h3>
            <p>
              In cases of natural disasters, pandemics, political unrest, or other force majeure events, special refund policies will apply.
            </p>

            <h2>Non-Refundable Items</h2>
            <ul>
              <li>Visa application fees</li>
              <li>Travel insurance premiums</li>
              <li>Special event tickets</li>
              <li>Custom tour arrangements</li>
            </ul>

            <h2>How to Request a Refund</h2>
            <p>
              To request a refund:
            </p>
            <ol>
              <li>Log in to your account</li>
              <li>Go to "My Bookings"</li>
              <li>Select the booking you wish to cancel</li>
              <li>Click "Request Cancellation"</li>
              <li>Provide reason for cancellation</li>
            </ol>

            <h2>Contact Us</h2>
            <p>
              For refund inquiries:
              <br />
              Email: refunds@gctraveltours.com
              <br />
              Phone: +63 917 123 4567
              <br />
              Business Hours: Monday-Friday, 9 AM - 6 PM (PHT)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}