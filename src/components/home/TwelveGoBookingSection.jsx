import React from "react";
import { Bus, Train, Ship, ExternalLink, MapPin } from "lucide-react";
import TwelveGoFormWidget from "@/components/twelvego/TwelveGoFormWidget";

const REFERRAL_URL = "https://12go.asia/?z=15166459";

export default function TwelveGoBookingSection() {
  return (
    <section className="py-12 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-semibold mb-4">
            <MapPin className="w-4 h-4" />
            Global Transport Booking
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Book Buses, Ferries &amp; Trains Worldwide
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm md:text-base">
            Search any origin and destination across Asia and beyond. Powered by 12Go Asia —
            tickets issued instantly with ArGie-C Travel &amp; Tours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Search Form Embed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-200">
              <Bus className="w-5 h-5 text-amber-600" />
              <Train className="w-5 h-5 text-amber-600" />
              <Ship className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-sm">Search &amp; Book Tickets</span>
            </div>
            <div className="flex justify-center w-full">
              <TwelveGoFormWidget width={250} height={320} />
            </div>
          </div>

          {/* Referral CTA Card */}
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 md:p-8 text-white flex flex-col justify-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Explore the Full 12Go Network
            </h3>
            <p className="text-amber-50 text-sm md:text-base mb-5 leading-relaxed">
              Can't find your route in the quick search? Browse the complete 12Go Asia schedule —
              flights, ferries, buses, trains, and transfers across 40+ countries.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-amber-50">
              <li className="flex items-center gap-2"><Bus className="w-4 h-4" /> Bus &amp; minivan routes</li>
              <li className="flex items-center gap-2"><Ship className="w-4 h-4" /> Ferry &amp; boat transfers</li>
              <li className="flex items-center gap-2"><Train className="w-4 h-4" /> Train &amp; rail passes</li>
            </ul>
            <a
              href={REFERRAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-amber-700 font-semibold px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors w-fit shadow-md"
            >
              Open 12Go Homepage
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-amber-100 text-xs mt-4">
              A 15% service fee is added at checkout for bookings referenced through ArGie-C.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}