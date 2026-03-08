import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Shield, CheckCircle, Lock, FileCheck, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SafeAndSecure() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Link to={createPageUrl("Home")} className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Safe & Secure Bookings</h1>
          <p className="text-lg text-slate-600">Your safety is our top priority with verified partners and secure transactions</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Amadeus GDS Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                GC Travel and Tours is fully integrated with <strong>Amadeus Global Distribution System (GDS)</strong>, 
                the world's leading travel technology platform. All flight bookings are processed through Amadeus, 
                ensuring real-time availability, secure payment processing, and instant booking confirmations.
              </p>
              <p>
                Our Amadeus integration guarantees that all travel inventory is sourced directly from verified airlines 
                and suppliers, providing you with legitimate, secure bookings backed by industry-standard protocols.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-blue-600" />
                Online Travel Agency (OTA) Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                As a registered Online Travel Agency, we adhere to international OTA standards and best practices, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Transparent Pricing:</strong> All prices displayed include taxes and fees upfront with no hidden charges</li>
                <li><strong>Secure Payment Gateway:</strong> PCI DSS compliant payment processing for credit/debit card transactions</li>
                <li><strong>Data Protection:</strong> Compliance with Philippine Data Privacy Act (RA 10173) and GDPR</li>
                <li><strong>Customer Rights:</strong> Clear cancellation, refund, and modification policies</li>
                <li><strong>24/7 Support:</strong> Dedicated customer service for booking assistance and emergencies</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-purple-600" />
                Banking & Payment Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                We partner with secure, regulated payment providers to protect your financial information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe Payment Processing:</strong> Industry-leading payment gateway with bank-level encryption (256-bit SSL/TLS)</li>
                <li><strong>PCI DSS Level 1 Certified:</strong> Highest level of payment card security certification</li>
                <li><strong>PayMongo Integration:</strong> Local Philippine payment gateway for secure bank transfers and e-wallet payments</li>
                <li><strong>No Card Data Storage:</strong> Your payment details are never stored on our servers</li>
                <li><strong>3D Secure Authentication:</strong> Additional layer of verification for online card transactions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-amber-600" />
                Verified Supplier Network
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                We work exclusively with verified, licensed travel suppliers including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Accredited Airlines:</strong> IATA-certified carriers with verified safety records</li>
                <li><strong>Licensed Hotels:</strong> DOT-accredited accommodations with business permits</li>
                <li><strong>Trusted Ground Operators:</strong> Bonded and insured tour operators and transport providers</li>
                <li><strong>Regular Audits:</strong> Continuous monitoring of supplier compliance and service quality</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Legal Compliance & Registrations</h3>
              <div className="text-sm text-slate-700 space-y-2">
                <p><strong>Business Name:</strong> GC Travel and Tours Agency</p>
                <p><strong>DTI Registration:</strong> Certificate of Business Name Registration No. 3956850</p>
                <p><strong>Business Permit:</strong> Mayor's Permit issued by Imus City, Cavite</p>
                <p><strong>TIN Number:</strong> 940-103-656-0000</p>
                <p><strong>Location:</strong> Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2, Imus, Cavite 4103</p>
                <p className="pt-2 text-xs text-slate-600">
                  All bookings are governed by our Terms of Service, Privacy Policy, and applicable laws of the Republic of the Philippines.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <p className="text-slate-600 mb-4">Have questions about our security measures?</p>
            <Link to={createPageUrl("Contact")}>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}