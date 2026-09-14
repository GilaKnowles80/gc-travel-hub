import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Lock, FileText, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SoftwareLicense() {
  const [form, setForm] = useState({ name: "", email: "", organization: "", intendedUse: "", budget: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.functions.invoke("createSupportTicket", {
        subject: "Software License Request",
        message: `Name: ${form.name}\nEmail: ${form.email}\nOrganization: ${form.organization}\nIntended Use: ${form.intendedUse}\nBudget: ${form.budget}`,
        priority: "high",
        category: "licensing",
      });
      setSubmitted(true);
      toast.success("License request submitted. We'll contact you within 48 hours.");
    } catch (err) {
      toast.error("Failed to submit. Please email info@gctravelandtours.com directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Software License & Ownership
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            This platform is proprietary software. Unauthorized copying, redistribution, or
            reuse is strictly prohibited.
          </p>
        </div>

        {/* License Notice */}
        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Copyright & License Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-100 dark:border-amber-900">
              <p className="font-semibold text-slate-900 dark:text-white mb-2">
                © {new Date().getFullYear()} ArGie-C Travel and Tours Agency
              </p>
              <p className="mb-3">
                <span className="font-semibold">Licensed to:</span> Gila Arayan Cain Gul
              </p>
              <p className="mb-3">
                <span className="font-semibold">License Type:</span> Single-Entity License
              </p>
              <p>
                <span className="font-semibold">License Number:</span> ARGC-TRVL-2026-001
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 dark:text-white">Terms of Use</h4>
              <ul className="space-y-2 list-disc pl-5">
                <li>This software is the exclusive property of ArGie-C Travel and Tours Agency, licensed to Gila Arayan Cain Gul for operational use.</li>
                <li>Copying, modifying, distributing, or creating derivative works of this software without express written permission is prohibited.</li>
                <li>Any permitted reuse or licensing requires a separate paid license agreement with ArGie-C Travel and Tours Agency.</li>
                <li>Unauthorized use constitutes copyright infringement and may result in legal action.</li>
              </ul>
            </div>

            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-100 dark:border-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-semibold">Warning:</span> This platform is protected by
                international copyright laws. Violators will be prosecuted to the full extent of the law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Request to License */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              Request a Software License
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Request Received</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Thank you for your interest in licensing this software. Our team will review your
                  request and contact you within 48 hours with licensing options and pricing.
                </p>
                <Button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", organization: "", intendedUse: "", budget: "" }); }}>
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Interested in licensing this platform for your own business? Fill out the form below
                  and our licensing team will get back to you with a paid license agreement.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" required value={form.name} onChange={handleChange} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization / Company</Label>
                  <Input id="organization" name="organization" value={form.organization} onChange={handleChange} placeholder="Your company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intendedUse">Intended Use *</Label>
                  <Textarea id="intendedUse" name="intendedUse" required value={form.intendedUse} onChange={handleChange}
                    placeholder="Describe how you intend to use or adapt this software..." rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">License Budget (USD)</Label>
                  <Input id="budget" name="budget" value={form.budget} onChange={handleChange} placeholder="e.g. $5,000 - $10,000" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-amber-600 hover:bg-amber-700">
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" /> Submit License Request</>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  By submitting, you acknowledge that this request does not grant any license rights
                  until a formal agreement is signed.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400 space-y-1">
          <p>Questions about licensing? Contact us directly:</p>
          <p><a href="mailto:info@gctravelandtours.com" className="text-amber-600 font-semibold hover:underline">info@gctravelandtours.com</a> · +63 915 440 1150</p>
        </div>
      </div>
    </div>
  );
}