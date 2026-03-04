import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, QrCode } from "lucide-react";

// Replace this URL with your actual GCash QR code image
// To get it: Open GCash app → My QR → Save/Download the QR image → Upload it to your app
const GCASH_QR_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/gcash_qr_placeholder.png";
const GCASH_NUMBER = "09154401150"; // Replace with your GCash number
const GCASH_NAME = "GC Travel and Tours";

export default function GCashQRModal({ open, onClose, amount, bookingType, bookingId }) {
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(GCASH_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <QrCode className="w-5 h-5" />
            Scan GCash QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          {/* Amount to Pay */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium">Amount to Send</p>
            <p className="text-3xl font-bold text-blue-700">₱{amount?.toLocaleString()}</p>
            <p className="text-xs text-blue-500 mt-1">Booking Ref: {bookingId}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="border-4 border-blue-500 rounded-2xl p-2 bg-white shadow-lg">
              <img
                src={GCASH_QR_URL}
                alt="GCash QR Code"
                className="w-48 h-48 object-contain rounded-xl"
                onError={(e) => {
                  // Fallback: show placeholder if no QR uploaded yet
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-48 h-48 hidden items-center justify-center bg-slate-100 rounded-xl flex-col gap-2">
                <QrCode className="w-16 h-16 text-slate-400" />
                <p className="text-xs text-slate-500 text-center px-2">Upload your GCash QR image to enable this</p>
              </div>
            </div>
          </div>

          {/* GCash Number */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-slate-500">GCash Account</p>
            <p className="font-bold text-slate-800 text-lg">{GCASH_NUMBER}</p>
            <p className="text-xs text-slate-500">{GCASH_NAME}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyNumber}
              className="mt-2 gap-1 text-xs"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy Number"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-left space-y-1 bg-green-50 rounded-xl p-3 border border-green-200">
            <p className="text-xs font-bold text-green-800">How to pay:</p>
            <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
              <li>Open GCash app on your phone</li>
              <li>Tap <strong>Send Money</strong> or <strong>Scan QR</strong></li>
              <li>Scan the QR code above OR enter the number</li>
              <li>Enter exactly <strong>₱{amount?.toLocaleString()}</strong></li>
              <li>Add booking ref <strong>{bookingId}</strong> in the note/message</li>
              <li>Send & screenshot your receipt</li>
            </ol>
          </div>

          {/* Send proof */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-800">
            📸 After payment, send your GCash receipt to our team via{" "}
            <a href="https://m.me/GCTravelandTours" target="_blank" rel="noopener noreferrer" className="font-bold underline">
              Facebook Messenger
            </a>{" "}
            or{" "}
            <a href="https://wa.me/639154401150" target="_blank" rel="noopener noreferrer" className="font-bold underline">
              WhatsApp
            </a>{" "}
            for confirmation.
          </div>

          <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
            Done — I've sent the payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}