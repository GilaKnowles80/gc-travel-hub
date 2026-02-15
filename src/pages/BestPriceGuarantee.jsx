import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { DollarSign, Tag, TrendingDown, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BestPriceGuarantee() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <Link to={createPageUrl("Home")} className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <DollarSign className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Best Price Guarantee</h1>
          <p className="text-lg text-slate-600">Competitive pricing with no hidden fees — guaranteed</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Price Promise</h2>
              <p className="text-slate-700 text-lg leading-relaxed">
                At GC Travel and Tours, we guarantee competitive pricing on all bookings. If you find a lower price for the same 
                flight, hotel, or tour package with identical conditions within 24 hours of booking, we'll refund the difference 
                plus give you an additional 5% credit toward your next booking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingDown className="w-6 h-6 text-green-600" />
                Amadeus Global Pricing Network
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                Our integration with <strong>Amadeus GDS</strong> gives us direct access to real-time airline inventory and pricing 
                from over 490 airlines worldwide. This means:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Live Pricing:</strong> Up-to-the-minute fares directly from airlines, not third-party markups</li>
                <li><strong>Bulk Negotiated Rates:</strong> Access to special contract fares not available to the general public</li>
                <li><strong>Instant Fare Comparison:</strong> Automated checking across multiple airlines and booking classes</li>
                <li><strong>Dynamic Pricing:</strong> Real-time adjustments based on demand, seasonality, and availability</li>
              </ul>
              <p className="text-sm text-slate-600 italic pt-2">
                Amadeus powers over 60% of global travel bookings, ensuring you get the best available rates from the world's 
                most comprehensive travel distribution platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-blue-600" />
                Exclusive Airline & OTA Promotions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                We partner directly with airlines and Online Travel Agencies (OTAs) to bring you exclusive promotional fares:
              </p>
              <div className="grid md:grid-cols-2 gap-4 my-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Airline Partnerships</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Philippine Airlines</li>
                    <li>• Cebu Pacific</li>
                    <li>• AirAsia</li>
                    <li>• Cathay Pacific</li>
                    <li>• Singapore Airlines</li>
                    <li>• Qatar Airways</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">OTA Partners</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Biyaheko.ph</li>
                    <li>• Wanderlinx</li>
                    <li>• Tripzynx</li>
                    <li>• Trip.com</li>
                    <li>• Expedia</li>
                    <li>• Traveloka</li>
                  </ul>
                </div>
              </div>
              <p>
                These partnerships give us access to flash sales, promo codes, seasonal discounts, and exclusive member rates 
                that we pass directly to our customers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Supplier Direct Deals
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                Beyond standard rates, we maintain direct relationships with travel suppliers to secure special promotions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Hotel Bulk Contracts:</strong> Pre-negotiated rates with major hotel chains and boutique properties</li>
                <li><strong>Tour Operator Packages:</strong> Exclusive discounts on multi-day tours and experiences</li>
                <li><strong>Ground Transport Deals:</strong> Preferred rates on car rentals, private transfers, and bus services</li>
                <li><strong>Insurance Bundles:</strong> Discounted travel insurance when bundled with bookings</li>
                <li><strong>Early Bird Specials:</strong> Limited-time offers for advanced bookings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Transparent Pricing Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 space-y-3">
              <p>
                Unlike many booking platforms, we believe in complete pricing transparency:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>No Hidden Fees:</strong> All taxes, surcharges, and service fees are displayed upfront</li>
                <li><strong>Clear Breakdown:</strong> Itemized pricing showing base fare, taxes, and any additional charges</li>
                <li><strong>Real-Time Updates:</strong> Prices update instantly to reflect current availability and rates</li>
                <li><strong>Multi-Currency Support:</strong> View prices in PHP, USD, EUR, or other major currencies</li>
                <li><strong>Price Lock Option:</strong> Hold your fare for 24 hours (on eligible bookings)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5 text-green-600" />
                How to Claim Your Best Price Guarantee
              </h3>
              <ol className="list-decimal pl-6 space-y-2 text-slate-700">
                <li>Book your travel through GC Travel and Tours</li>
                <li>If you find a lower price within 24 hours, send us proof (screenshot, link, or booking reference)</li>
                <li>We'll verify the pricing and conditions match your booking</li>
                <li>Receive a refund of the difference + 5% credit toward your next booking</li>
              </ol>
              <p className="text-sm text-slate-600 mt-4">
                <strong>Terms apply:</strong> Comparison must be for identical flights/hotels (same dates, times, class, 
                cancellation policy) and from a legitimate travel agency or airline.
              </p>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <p className="text-slate-600 mb-4">Found a better price? Let us know!</p>
            <Link to={createPageUrl("Contact")}>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Submit Price Match Request
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}