import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { QrCode, Building2, Wallet, CreditCard, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentMethods() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Link to={createPageUrl("Home")} className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Wallet className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Payment Methods</h1>
          <p className="text-lg text-slate-600">Fast, secure, and convenient ways to pay</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Instant QR Code Payments</h2>
              <p className="text-slate-700 text-lg leading-relaxed mb-4">
                Pay instantly using your favorite e-wallet by scanning a QR code. Fast, secure, and directly connected 
                to our verified bank account through PayMongo - the Philippines' trusted payment gateway.
              </p>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">BSP-Registered & PCI DSS Certified</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  GCash Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700">
                  Scan QR code with your GCash app for instant payment confirmation.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Instant confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>No processing fees for customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24/7 availability</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  PayMaya Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700">
                  Quick and secure payments using PayMaya QR code scanning.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time payment tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Secure encryption</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automatic receipt</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  Bank Transfer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700">
                  Direct bank transfers via InstaPay or PESONet to our verified account.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>All major banks supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>InstaPay: Real-time transfer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>PESONet: Next-day processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  Credit/Debit Card
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-700">
                  Pay with Visa, Mastercard, or other major credit/debit cards via Stripe.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>International cards accepted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>3D Secure authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>PCI compliant processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                Security & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                All payments are processed through <strong>PayMongo</strong> and <strong>Stripe</strong>, 
                both BSP-registered and internationally certified payment gateways.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">PayMongo Security</h4>
                  <ul className="text-sm space-y-1">
                    <li>• BSP-registered PSO (E-Money Issuer)</li>
                    <li>• PCI DSS Level 1 compliant</li>
                    <li>• 256-bit SSL encryption</li>
                    <li>• Real-time fraud detection</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-2">Stripe Security</h4>
                  <ul className="text-sm space-y-1">
                    <li>• PCI DSS Level 1 certified</li>
                    <li>• 3D Secure 2.0 authentication</li>
                    <li>• Bank-level encryption</li>
                    <li>• Fraud prevention tools</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Bank Account Information</h3>
              <p className="text-slate-700 mb-3">
                All payments are deposited directly to our verified business bank account:
              </p>
              <div className="bg-white p-4 rounded-lg space-y-1 text-sm">
                <p><strong>Account Name:</strong> GC Travel and Tours Agency</p>
                <p><strong>Owner:</strong> Gila Cain Knowles</p>
                <p><strong>Business Registration:</strong> DTI No. 3956850</p>
                <p><strong>TIN:</strong> 940-103-656-0000</p>
                <p className="text-xs text-slate-600 pt-2">
                  Connected through PayMongo's verified merchant program. All transactions are traceable and regulated.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <p className="text-slate-600 mb-4">Questions about payment methods?</p>
            <Link to={createPageUrl("Contact")}>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Contact Support
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}