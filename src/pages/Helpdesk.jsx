import React from "react";
import HelpdeskForm from "@/components/helpdesk/HelpdeskForm";
import CustomerCallButton from "@/components/support/CustomerCallButton";
import { Phone } from "lucide-react";

export default function Helpdesk() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Contact Support</h1>
          <p className="text-slate-600 mt-2">We're here to help. Submit your inquiry and we'll get back to you within 24 hours.</p>
        </div>

        {/* Browser Call Support */}
        <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-slate-900">Talk to an Agent Directly</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">Call us right now from your browser — no phone needed!</p>
          <CustomerCallButton />
        </div>

        <HelpdeskForm />
      </div>
    </div>
  );
}