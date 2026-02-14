import React from "react";
import HelpdeskForm from "@/components/helpdesk/HelpdeskForm";

export default function Helpdesk() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Contact Support</h1>
          <p className="text-slate-600 mt-2">We're here to help. Submit your inquiry and we'll get back to you within 24 hours.</p>
        </div>
        <HelpdeskForm />
      </div>
    </div>
  );
}