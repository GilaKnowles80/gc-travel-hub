import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, QrCode, Shield } from "lucide-react";

const PAYPAL_QR_URL = "https://media.base44.com/images/public/698ba6f12468e8d5e020a7b5/f28941448_Auto-BuildWise-qrcodePayPal.png";
const ACCOUNT_NAME = "ArGie-C Travel & Tours";
const PAYPAL_EMAIL = "gctravelandtours2021@gmail.com";

export default function PayMongoQRModal({ open, onClose, amount, bookingType, bookingId }) {
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PAYPAL_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#003087]">
            <QrCode className="w-5 h-5" />
            PayPal QR — Scan to Pay
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          {/* Amount */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
            <p className="text-xs text-blue-600 font-medium">Amount to Send</p>
            <p className="text-3xl font-bold text-[#003087]">₱{(amount || 0).toLocaleString()}</p>
            {bookingId && <p className="text-xs text-blue-500 mt-1">Booking Ref: {bookingId}</p>}
          </div>

          {/* QR Code Image */}
          <div className="flex justify-center">
            <div className="border-4 border-[#003087] rounded-2xl p-3 bg-white shadow-lg">
              <img
                src={PAYPAL_QR_URL}
                alt="ArGie-C Travel & Tours — PayPal QR Code"
                className="w-72 h-72 object-contain rounded-xl"
                style={{ imageRendering: 'high-quality' }}
              />
            </div>
          </div>

          {/* Powered by PayPal badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3 text-green-500" />
            Powered by <span className="font-bold text-[#003087]">PayPal</span> — Buyer Protection Included
          </div>

          {/* Account Info */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs text-slate-500">Account Name</p>
            <p className="font-bold text-slate-800">{ACCOUNT_NAME}</p>
            <p className="text-xs text-slate-500 mt-1">PayPal Email</p>
            <p className="font-semibold text-slate-700 break-all">{PAYPAL_EMAIL}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyNumber}
              className="mt-2 gap-1 text-xs"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy Email"}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-left bg-green-50 rounded-xl p-3 border border-green-200">
            <p className="text-xs font-bold text-green-800 mb-1">How to pay via PayPal QR:</p>
            <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
              <li>Open your <strong>PayPal app</strong> on your phone</li>
              <li>Tap <strong>Scan</strong> in the PayPal app</li>
              <li>Scan the QR code above</li>
              <li>Enter exactly <strong>₱{(amount || 0).toLocaleString()}</strong></li>
              {bookingId && <li>Add <strong>{bookingId}</strong> in the notes field</li>}
              <li>Confirm and send payment</li>
              <li>Screenshot your receipt</li>
            </ol>
          </div>

          {/* Compatible apps */}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-200 text-xs text-blue-800">
            <p className="font-bold mb-1">✅ Compatible with:</p>
            <p>PayPal app · PayPal balance · Bank · Credit/Debit Card</p>
          </div>

          {/* Send proof */}
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-800">
            📸 After payment, send your receipt screenshot to our team via{" "}
            <a href="https://m.me/GCTravelandTours" target="_blank" rel="noopener noreferrer" className="font-bold underline">
              Facebook Messenger
            </a>{" "}
            or{" "}
            <a href="https://wa.me/639154401150" target="_blank" rel="noopener noreferrer" className="font-bold underline">
              WhatsApp
            </a>{" "}
            for booking confirmation.
          </div>

          <Button onClick={onClose} className="w-full bg-[#0063B0] hover:bg-blue-800 text-white">
            Done — I've sent the payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}