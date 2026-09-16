import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { QrCode, Mail, Copy, CheckCircle2, Loader2, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const PAYPAL_EMAIL = "gctravelandtours2021@gmail.com";
const QR_CODE_URL = "https://media.base44.com/images/public/698ba6f12468e8d5e020a7b5/f28941448_Auto-BuildWise-qrcodePayPal.png";

export default function PayPalManualPayment({ amount, currency = "USD", bookingData, onSuccess }) {
  const [view, setView] = useState("choose"); // choose | qr | email
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceNo, setReferenceNo] = useState("");
  const [error, setError] = useState(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PAYPAL_EMAIL);
    setCopied(true);
    toast.success("PayPal email copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    if (!referenceNo.trim()) {
      setError("Please enter the PayPal transaction/reference number you received after sending payment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await base44.functions.invoke("notifyCheckoutPayment", {
        bookingType: bookingData?.bookingType || "general",
        bookingId: bookingData?.bookingId || "",
        amount,
        currency,
        paymentMode: view === "qr" ? "paypal_qr" : "paypal_email",
        customerEmail: bookingData?.customerEmail || "",
        customerName: bookingData?.customerName || "",
        referenceNo: referenceNo.trim(),
      });
      toast.success("Payment submitted! We'll verify and confirm your booking shortly.");
      setSubmitting(false);
      if (onSuccess) onSuccess({ status: "pending_verification", referenceNo: referenceNo.trim() });
    } catch (e) {
      setError(e.message || "Failed to submit payment confirmation. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img
            src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
            alt="PayPal"
            className="h-6"
          />
          Pay via PayPal (Manual)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">{error}</Alert>
        )}

        {/* Amount summary */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-600">Amount to send</p>
          <p className="text-2xl font-bold text-amber-600">
            {currency} {Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {view === "choose" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 text-center">
              Choose how you'd like to send your PayPal payment:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setView("qr")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <QrCode className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold text-slate-900">Scan QR Code</p>
                <p className="text-xs text-slate-500">Scan with your PayPal app to pay instantly</p>
              </button>
              <button
                onClick={() => setView("email")}
                className="p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <Mail className="w-8 h-8 text-blue-600 mb-2" />
                <p className="font-semibold text-slate-900">Send to PayPal Email</p>
                <p className="text-xs text-slate-500">Log in to PayPal and send to our email</p>
              </button>
            </div>
          </div>
        )}

        {view === "qr" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm">
                <img
                  src={QR_CODE_URL}
                  alt="PayPal QR Code for gctravelandtours2021@gmail.com"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center max-w-xs">
                Open your PayPal app, tap Scan, and scan this QR code to send payment to <strong>{PAYPAL_EMAIL}</strong>
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setView("choose")}>
              ← Back to options
            </Button>
          </div>
        )}

        {view === "email" && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <p className="text-xs text-slate-500">Send payment to this PayPal email address:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-slate-200 break-all">
                  {PAYPAL_EMAIL}
                </code>
                <Button size="icon" variant="outline" onClick={handleCopyEmail} title="Copy email">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Log in to your PayPal account, choose "Send & Request", enter the email above, and send the exact amount.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setView("choose")}>
              ← Back to options
            </Button>
          </div>
        )}

        {view !== "choose" && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                After sending payment, enter the PayPal transaction/reference number below so we can verify and confirm your booking.
              </p>
            </div>
            <div>
              <Label htmlFor="ref-no">PayPal Transaction / Reference Number *</Label>
              <Input
                id="ref-no"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. 9XJ12345AB678901C"
                className="mt-1"
              />
            </div>
            <Button className="w-full" onClick={handleConfirmPayment} disabled={submitting}>
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> I've Sent the Payment</>
              )}
            </Button>
          </div>
        )}

        <div className="text-xs text-slate-500 space-y-1 pt-2 border-t">
          <p>• Your booking will be confirmed after we verify your PayPal payment</p>
          <p>• Verification typically takes 1–2 hours during business hours</p>
          <p>• Save your PayPal transaction ID for your records</p>
        </div>
      </CardContent>
    </Card>
  );
}