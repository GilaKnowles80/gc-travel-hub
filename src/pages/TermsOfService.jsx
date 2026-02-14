import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Card } from "@/components/ui/card";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-amber-500" />
            Terms of Service
          </h1>
          <p className="text-slate-600">Last updated: February 14, 2026</p>
        </div>

        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">
            <strong>Important Legal Notice:</strong> GC Travel & Tours operates as an Online Travel Agency (OTA) under the Amadeus global distribution system. Our services are governed by Amadeus platform terms, international travel regulations, and the terms outlined below. By using our services, you acknowledge and accept these legally binding conditions.
          </p>
        </div>

        <Card className="p-8 border-0 shadow-sm">
          <div className="prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms & Amadeus Platform Compliance</h2>
            <p>
              By accessing and using GC Travel & Tours services, you accept and agree to be bound by these terms and provisions. As an Amadeus-certified OTA, we comply with:
            </p>
            <ul>
              <li>Amadeus selling platform terms and conditions</li>
              <li>Strict data confidentiality requirements</li>
              <li>Prohibition of unauthorized third-party access</li>
              <li>International travel industry standards and regulations</li>
            </ul>

            <h2>2. Booking and Reservations</h2>
            <p>
              All bookings made through our platform are subject to availability and confirmation. We reserve the right to cancel or modify bookings in exceptional circumstances. Users are responsible for providing accurate booking information.
            </p>
            <ul>
              <li>Flight bookings are confirmed upon successful payment and airline confirmation</li>
              <li>Hotel reservations are subject to property availability and confirmation</li>
              <li>Tour packages require minimum participant numbers for confirmation</li>
              <li><strong>Data Accuracy:</strong> You warrant that all booking information provided (name, email, passport details, contact information) is accurate, current, and truthful</li>
              <li><strong>24-Hour Cancellation Right:</strong> For flights booked at least 7 days before departure, cancellation without penalty is permitted within 24 hours of booking per Amadeus guidelines</li>
            </ul>

            <h2>3. Payment Terms</h2>
            <p>
              All payments must be made in full at the time of booking unless otherwise specified. We accept major credit cards and digital payment methods through our secure payment gateway.
            </p>

            <h2>4. Cancellation and Refunds</h2>
            <p>
              Cancellation policies vary depending on the type of service booked. Please refer to our Refund Policy for detailed information. Important notes:
            </p>
            <ul>
              <li><strong>Amadeus System Policies:</strong> Flight refunds (including involuntary refunds for cancelled flights) are processed according to the airline's policy and specific Amadeus status codes (e.g., UN for involuntary refunds)</li>
              <li><strong>OTA Obligations:</strong> Our refund obligations as an OTA may differ from direct carrier obligations; refund eligibility depends on the specific fare class purchased and airline terms</li>
              <li><strong>Package Tours:</strong> Cancellation of package tours generally requires refund processing within 14 calendar days per industry standards</li>
              <li><strong>Automatic Refunds:</strong> Refunds for cancelled flights (involuntary) are processed per airline policy; contact our support team for status updates</li>
            </ul>

            <h2>5. Travel Documents & Data Integrity</h2>
            <p>
              Travelers are responsible for ensuring they have valid passports, visas, and other required travel documents. GC Travel & Tours is not liable for denial of entry due to invalid documentation.
            </p>
            <ul>
              <li>All passenger names provided must exactly match passport documentation</li>
              <li>You are responsible for ensuring compliance with all applicable travel regulations and entry requirements</li>
              <li><strong>Data Integrity & Security:</strong> We ensure the legality and accuracy of booking data per Amadeus requirements. All financial transactions comply with PCI-DSS security standards</li>
            </ul>

            <h2>6. Liability and Limitation of Liability</h2>
            <p>
              GC Travel & Tours acts as an intermediary (OTA) between travelers and service providers. Our liability is strictly limited as follows:
            </p>
            <ul>
              <li>We are not liable for delays, cancellations, or schedule changes made by airlines, hotels, or tour operators</li>
              <li>We are not responsible for service quality, accommodations, or amenities provided by third-party service providers</li>
              <li>We are not liable for acts beyond our control including force majeure, natural disasters, pandemics, or political unrest</li>
              <li>Refunds are subject to availability and processing by third-party service providers</li>
              <li><strong>Maximum Liability:</strong> Our total liability shall not exceed the amount you paid for the specific booking in question</li>
            </ul>

            <h2>7. User Conduct & System Integrity</h2>
            <p>
              Customers are expected to conduct themselves appropriately during their travel and on our platform. Inappropriate behavior, fraudulent activities, or system misuse may result in immediate termination of services without refund.
            </p>
            <ul>
              <li>Users must not transmit viruses, malware, or use automated bots that may compromise system integrity</li>
              <li><strong>Prohibited Activities:</strong> Fraud, unauthorized access, reselling of booking data, or violation of Amadeus confidentiality terms</li>
              <li><strong>Fraudulent Activities:</strong> Any fraudulent booking, false information, or misuse of the system will result in immediate account suspension and potential legal action</li>
              <li>Users are solely responsible for maintaining confidentiality of their account credentials</li>
            </ul>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>

            <h2>9. Third-Party Data Protection & Confidentiality</h2>
            <p>
              In compliance with Amadeus platform requirements and international data protection laws:
            </p>
            <ul>
              <li><strong>Strict Confidentiality:</strong> We maintain strict confidentiality of access data and prohibit unauthorized third-party use</li>
              <li>Booking data, passenger information, and system access credentials are confidential and cannot be copied, sold, or transferred</li>
              <li>All data shared with partner airlines, hotels, and tour operators is for booking purposes only</li>
              <li>We do not allow unauthorized third parties to access our booking system</li>
            </ul>

            <h2>10. Compliance with Transportation Regulations</h2>
            <p>
              For flights operating from or to the United States, refunds are processed in accordance with US Department of Transportation (US DOT) regulations:
            </p>
            <ul>
              <li><strong>US DOT Refund Requirements:</strong> A refund is due within 7 business days after you reject a significantly changed flight or within your airline's required timeframe</li>
              <li>For involuntary refunds (airline cancellations), refunds are processed per airline policy</li>
              <li>International flights may be subject to different regulatory requirements based on departure/arrival jurisdictions</li>
            </ul>

            <h2>11. Contact Information</h2>
             <p>
               For questions about these Terms of Service, please contact us at:
               <br />
               <strong>Email:</strong> info@gctravelandtours.com
               <br />
               <strong>Phone:</strong> +63 915 440 1150 / +63 962 059 5263
               <br />
               <strong>Address:</strong> Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2, Imus, Cavite 4103, Philippines
             </p>

             <h2>12. Governing Law and Dispute Resolution</h2>
             <p>
               These Terms of Service are governed by the laws of the Republic of the Philippines. Any disputes arising from use of our services shall be subject to the jurisdiction of Philippine courts and applicable international travel industry regulations.
             </p>
          </div>
        </Card>
      </div>
    </div>
  );
}