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

          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Data Privacy Compliance Notice:</strong> GC Travel & Tours is committed to complying with the <strong>Philippine Data Privacy Act (RA 10173)</strong>, <strong>GDPR</strong>, and international data protection standards. This Privacy Policy outlines how we collect, process, and protect your personal information in accordance with these legal frameworks.
          </p>
          </div>

          <Card className="p-8 border-0 shadow-sm">
          <div className="prose prose-slate max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              In compliance with the <strong>Data Privacy Act and GDPR</strong>, we collect only information that is necessary and relevant to provide travel services. We collect information that you provide directly to us, including:
            </p>
            <ul>
              <li>Personal details (name, email, phone number)</li>
              <li>Passport and travel document information</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Booking preferences and travel history</li>
            </ul>
            <p className="text-sm text-slate-600 mt-4">
              <strong>Legal Basis:</strong> Collection is based on your explicit consent, contractual necessity for booking services, and our legitimate business interests in compliance with RA 10173 and GDPR Article 6.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              In accordance with the <strong>Philippine Data Privacy Act</strong> and <strong>GDPR principles of purpose limitation</strong>, we use your information only for specified, explicit, and legitimate purposes:
            </p>
            <ul>
              <li>Process your bookings and reservations</li>
              <li>Send booking confirmations and updates</li>
              <li>Provide customer support and resolve disputes</li>
              <li>Improve our services and user experience</li>
              <li>Send promotional offers (with your prior opt-in consent)</li>
              <li>Comply with legal obligations and regulatory requirements</li>
            </ul>
            <p className="text-sm text-slate-600 mt-4">
              <strong>Data Minimization:</strong> We only use personal information that is adequate, relevant, and not excessive for the stated purposes.
            </p>

            <h2>3. Information Sharing</h2>
            <p>
              In compliance with <strong>RA 10173 Section 13</strong> (Permitted Disclosures), we share your information only with:
            </p>
            <ul>
              <li>Service providers necessary to complete your booking (airlines, hotels, tour operators)</li>
              <li>Payment processors and financial institutions for transaction security</li>
              <li>Government agencies when legally required</li>
            </ul>
            <p>
              <strong>We do not sell, rent, or disclose your personal information to third parties for marketing purposes.</strong> All third-party service providers are contractually bound to maintain the confidentiality and security of your data in accordance with this policy.
            </p>

            <h2>4. Data Security & Data Integrity</h2>
            <p>
              In accordance with <strong>RA 10173 Section 21 (Data Security)</strong> and <strong>GDPR Article 32</strong>, we implement comprehensive security measures including:
            </p>
            <ul>
              <li>End-to-end encryption for all data transmissions</li>
              <li>SSL/TLS protocols for website security</li>
              <li>Secure payment processing through PCI-DSS compliant Stripe gateways</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and employee training on data protection</li>
            </ul>
            <p>
              All payment transactions are encrypted and processed through secure payment gateways. We maintain appropriate safeguards to ensure the accuracy, completeness, and integrity of your personal data.
            </p>

            <h2>5. Cookies and Tracking</h2>
            <p>
              Our website uses cookies to enhance user experience and analyze site usage. You can control cookie settings through your browser preferences.
            </p>

            <h2>6. Your Rights Under Data Privacy Regulations</h2>
            <p>
              As per the <strong>Philippine Data Privacy Act (RA 10173 Section 16)</strong> and <strong>GDPR Articles 15-22</strong>, you have the following rights:
            </p>
            <ul>
              <li><strong>Right to Access:</strong> Request and obtain a copy of your personal data held by us</li>
              <li><strong>Right to Correction/Rectification:</strong> Correct inaccurate or incomplete information</li>
              <li><strong>Right to Erasure ("Right to Be Forgotten"):</strong> Request deletion of your data when no longer necessary, subject to legal retention requirements</li>
              <li><strong>Right to Opt-out:</strong> Unsubscribe from marketing communications and data processing for non-essential purposes</li>
              <li><strong>Right to Data Portability:</strong> Request your data in a structured, commonly used format</li>
              <li><strong>Right to Object:</strong> Object to processing of your personal data for certain purposes</li>
            </ul>
            <p className="text-sm text-slate-600 mt-4">
              To exercise any of these rights, please contact our Data Protection Officer at the contact information provided in Section 10.
            </p>

            <h2>7. Data Retention</h2>
            <p>
              In compliance with <strong>RA 10173 Section 15</strong> (Data Retention Policy) and <strong>GDPR Article 5(e)</strong>, we retain your personal information for the following periods:
            </p>
            <ul>
              <li><strong>Booking & Transaction Records:</strong> 7 years (required for tax and legal compliance)</li>
              <li><strong>Customer Account Data:</strong> Until account closure, then 2 years for dispute resolution</li>
              <li><strong>Marketing Communications:</strong> Until you opt-out</li>
              <li><strong>Payment Information:</strong> Handled by Stripe per their retention policies</li>
            </ul>
            <p>
              After the retention period expires, we securely delete or anonymize your data. Data may be retained longer if required by law or for legitimate legal purposes.
            </p>

            <h2>8. Children's Privacy</h2>
            <p>
              Our services are not intended for users under 18. We do not knowingly collect information from children.
            </p>

            <h2>9. Changes to Privacy Policy</h2>
            <p>
              We may update this policy periodically. Changes will be posted on this page with an updated revision date.
            </p>

            <h2>10. Data Protection Officer & Contact Information</h2>
            <p>
              For privacy-related inquiries, data subject rights requests, or concerns regarding our handling of your personal information, please contact our Data Protection Officer:
              <br />
              <strong>Email:</strong> privacy@gctravelandtours.com
              <br />
              <strong>Phone:</strong> +63 915 440 1150 / +63 962 059 5263
              <br />
              <strong>Address:</strong> Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2, Imus, Cavite 4103, Philippines
              <br />
              <strong>Response Time:</strong> We will respond to all data subject requests within 30 calendar days in accordance with RA 10173 and GDPR requirements.
            </p>

            <h2>11. Regulatory Compliance & Legal Basis</h2>
            <p>
              GC Travel & Tours operates under and complies with the following legal frameworks:
            </p>
            <ul>
              <li><strong>Republic Act No. 10173 (Data Privacy Act of 2012):</strong> Philippine national data protection law regulating the processing of personal information</li>
              <li><strong>General Data Protection Regulation (GDPR):</strong> EU data protection framework applicable to users in the European Union</li>
              <li><strong>Local and International Data Protection Standards:</strong> Industry best practices for data security and privacy</li>
            </ul>
            <p>
              Our processing of personal data is based on one or more of the following legal bases:
            </p>
            <ul>
              <li>Your explicit informed consent</li>
              <li>Necessity for contract performance</li>
              <li>Compliance with legal or regulatory obligations</li>
              <li>Protection of vital interests</li>
              <li>Legitimate business interests</li>
            </ul>

            <h2>12. Changes to Privacy Policy</h2>
            <p>
              We may update this policy periodically to reflect changes in our practices or applicable laws. Material changes will be posted on this page with an updated revision date and, where required, your consent will be requested. Your continued use of our services constitutes acceptance of the updated policy.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}