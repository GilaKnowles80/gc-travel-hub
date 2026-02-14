import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-amber-500" />
            Privacy Policy
          </h1>
          <p className="text-slate-600">Last updated: February 14, 2026</p>
        </div>

        <Card className="p-8 border-0 shadow-sm">
          <div className="prose prose-slate max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul>
              <li>Personal details (name, email, phone number)</li>
              <li>Passport and travel document information</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Booking preferences and travel history</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Process your bookings and reservations</li>
              <li>Send booking confirmations and updates</li>
              <li>Provide customer support</li>
              <li>Improve our services</li>
              <li>Send promotional offers (with your consent)</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We share your information only with service providers necessary to complete your booking (airlines, hotels, tour operators). We do not sell your personal information to third parties.
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted and processed through secure payment gateways.
            </p>

            <h2>5. Cookies and Tracking</h2>
            <p>
              Our website uses cookies to enhance user experience and analyze site usage. You can control cookie settings through your browser preferences.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide services and comply with legal obligations.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 18. We do not knowingly collect information from children.
            </p>

            <h2>9. Changes to Privacy Policy</h2>
            <p>
              We may update this policy periodically. Changes will be posted on this page with an updated revision date.
            </p>

            <h2>10. Contact Us</h2>
            <p>
              For privacy-related inquiries, contact us at:
              <br />
              Email: privacy@gctraveltours.com
              <br />
              Phone: +63 917 123 4567
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}