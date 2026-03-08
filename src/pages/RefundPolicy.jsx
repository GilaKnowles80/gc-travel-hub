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
            <h2>Legal Framework & Key Timeframes</h2>
            
            <h3>Refund Processing Requirements</h3>
            <p>
              In accordance with international regulations and industry standards, GC Travel & Tours processes refunds within <strong>7 to 14 business days</strong> for cancelled flights under international/regional regulations (e.g., EU law) and US DOT rules. Airlines require a <strong>24-hour cancellation window</strong> for bookings made 7+ days before departure, with Amadeus systems processing involuntary refunds based on carrier-specific rules.
            </p>

            <h3>Refund Timeline by Payment Method</h3>
            <ul>
              <li><strong>Bank/Credit Card Payments:</strong> Refunds are typically processed within 7 business days of the cancellation request, though some financial institutions may take up to 20 calendar days.</li>
              <li><strong>Other Payment Methods:</strong> Alternative payment methods may take up to 20 calendar days for full processing.</li>
            </ul>

            <h2>Flight Bookings</h2>
            
            <h3>Cancellation by Customer</h3>
            <ul>
              <li><strong>More than 7 days before departure:</strong> 80% refund (20% cancellation fee)</li>
              <li><strong>3-7 days before departure:</strong> 50% refund</li>
              <li><strong>Less than 3 days before departure:</strong> No refund (subject to airline policy)</li>
              <li><strong>No-show:</strong> No refund</li>
              <li><strong>24-Hour Rule:</strong> For flights booked at least 7 days before departure, you may cancel for free within 24 hours of booking.</li>
            </ul>

            <h3>Flight Cancellation by Airline</h3>
            <p>
              If the airline cancels the flight, you are entitled to a full refund or rebooking on the next available flight at no additional cost. All involuntary refunds comply with Amadeus system policies and airline-specific rules including status codes (UN).
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
              <li><strong>More than 30 days before tour:</strong> 90% refund (10% administrative fee)</li>
              <li><strong>15-30 days before tour:</strong> 50% refund</li>
              <li><strong>Less than 15 days before tour:</strong> No refund</li>
            </ul>

            <p>
              <strong>Note:</strong> Package tour cancellation generally requires refund within 14 calendar days of cancellation request, in accordance with OTA standards.
            </p>

            <h3>Weather-Related Cancellations & Force Majeure</h3>
            <p>
              If a tour is cancelled due to severe weather, natural disasters, pandemics, political unrest, or other force majeure events, you will receive a full refund or credit for rescheduling. Special refund policies apply during extraordinary circumstances.
            </p>

            <h2>Refund Processing & Timeline</h2>
            
            <h3>Processing Timeline</h3>
            <p>
              Approved refunds are processed within <strong>7 to 14 business days</strong> from the date of cancellation request. For credit card and bank transfer payments, refunds are typically credited within 7 business days; however, your financial institution may require an additional 5-10 business days to reflect the credit.
            </p>

            <h3>Refund Processing Requirements</h3>
            <p>
              All refunds will be credited to the original payment method used for the booking. Refund amounts are subject to applicable cancellation fees as outlined in the respective booking categories above. Processing times begin immediately upon approval of the refund request.
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
              For refund inquiries and assistance:
              <br />
              <strong>Email:</strong> refunds@gctravelandtours.com
              <br />
              <strong>Phone:</strong> +63 915 440 1150 / +63 962 059 5263
              <br />
              <strong>Business Hours:</strong> 24/7 Online Transactions (Email and Phone support available)
              <br />
              <strong>Address:</strong> Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2, Imus, Cavite 4103, Philippines
            </p>

            <h2>Legal Disclaimer</h2>
            <p>
              GC Travel & Tours acts as an online travel agency (OTA) and is bound by airline, hotel, and tour operator policies regarding cancellations and refunds. OTA obligations may not be the same as carrier obligations. Refund eligibility and processing are subject to the specific terms and conditions of the service provider (airline, hotel, tour operator) and the fare class selected at time of booking. For legal advice regarding refund disputes, please consult with the appropriate regulatory authority or legal counsel.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}