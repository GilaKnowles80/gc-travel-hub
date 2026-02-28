import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Mail, AlertCircle } from "lucide-react";

export default function DocumentChecklistGenerator() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [checklist, setChecklist] = useState(null);

  // Document requirements database
  const countryRequirements = {
    japan: {
      country: "Japan",
      flag: "🇯🇵",
      visaType: "Temporary Visitor / Tourist Visa",
      processingTime: "5-7 days",
      fee: "₱3,500",
      duration: "90 days",
      documents: [
        { doc: "Valid Passport", required: true, notes: "6+ months validity from application date" },
        { doc: "Passport Copy (Data Page)", required: true, notes: "Copy of bio data page" },
        { doc: "Bank Certificate", required: true, notes: "From bank showing account status" },
        { doc: "3-Month Bank Statement", required: true, notes: "Showing regular deposits/balance" },
        { doc: "Income Tax Return (ITR)", required: true, notes: "Latest year OR Certificate of Non-Filing" },
        { doc: "Certificate of Employment (COE)", required: false, notes: "If employed, showing position & salary" },
        { doc: "Travel Itinerary", required: true, notes: "Detailed day-by-day plan" },
        { doc: "Flight Booking Confirmation", required: true, notes: "Roundtrip tickets" },
        { doc: "Hotel Reservation", required: true, notes: "Confirmed booking for accommodation" },
        { doc: "Completed Visa Application Form", required: true, notes: "Filled & signed" },
        { doc: "Passport-Size Photos", required: true, notes: "4x6 cm, white background (4 pieces)" }
      ]
    },
    usa: {
      country: "United States",
      flag: "🇺🇸",
      visaType: "B1/B2 Visitor Visa",
      processingTime: "10-30 days",
      fee: "₱8,800",
      duration: "10 years validity",
      documents: [
        { doc: "Valid Passport", required: true, notes: "6+ months validity beyond intended stay" },
        { doc: "DS-160 Confirmation", required: true, notes: "Online form confirmation page" },
        { doc: "Interview Appointment Confirmation", required: true, notes: "From US Embassy website" },
        { doc: "Passport-Size Photo", required: true, notes: "2x2 inches, white background" },
        { doc: "Bank Statements", required: true, notes: "6 months showing sufficient funds" },
        { doc: "Tax Returns (ITR)", required: true, notes: "Last 2 years or Certificate of Non-Filing" },
        { doc: "Employment Letter", required: false, notes: "If employed - position, salary, duration" },
        { doc: "Deed of Properties", required: false, notes: "If property owner - proof of assets" },
        { doc: "Business Documents", required: false, notes: "If business owner - company registration" },
        { doc: "Travel Itinerary", required: true, notes: "Purpose and duration of stay" },
        { doc: "Hotel Reservations", required: true, notes: "Accommodation booking or sponsor letter" },
        { doc: "Supporting Documents", required: false, notes: "Invitation letter, family ties documentation" }
      ]
    },
    australia: {
      country: "Australia",
      flag: "🇦🇺",
      visaType: "Visitor Visa (Subclass 600)",
      processingTime: "7-21 days",
      fee: "₱8,000",
      duration: "12 months validity",
      documents: [
        { doc: "Valid Passport", required: true, notes: "6+ months validity" },
        { doc: "Online ImmiAccount", required: true, notes: "Create account on IMMI website" },
        { doc: "Bank Statements", required: true, notes: "3-6 months showing financial capacity" },
        { doc: "Proof of Income", required: true, notes: "Salary slips, employment letter, ITR" },
        { doc: "Tax Returns", required: true, notes: "Last 2 years OR Certificate of Non-Filing" },
        { doc: "Travel History", required: true, notes: "List of countries visited in past 5 years" },
        { doc: "Flight Booking", required: true, notes: "Confirmed roundtrip tickets" },
        { doc: "Hotel Booking", required: true, notes: "Accommodation reservation" },
        { doc: "Travel Insurance", required: false, notes: "Optional but recommended" },
        { doc: "Medical Examination", required: false, notes: "If requested by IMMI after lodgement" },
        { doc: "Police Clearance", required: false, notes: "If requested (usually not for tourists)" },
        { doc: "Passport Photo", required: true, notes: "35x45 mm, color, white background" }
      ]
    },
    schengen: {
      country: "Schengen Area (EU)",
      flag: "🇪🇺",
      visaType: "Schengen Visa Type C",
      processingTime: "10-25 days",
      fee: "₱4,500",
      duration: "90 days / 180 days period",
      documents: [
        { doc: "Valid Passport", required: true, notes: "3+ months validity after intended return" },
        { doc: "Completed Visa Application Form", required: true, notes: "Schengen form (varies by country)" },
        { doc: "Passport-Size Photos", required: true, notes: "4x6 cm, white background (2-4 pieces)" },
        { doc: "Travel Insurance", required: true, notes: "Minimum €30,000 coverage" },
        { doc: "Bank Statements", required: true, notes: "3-6 months showing balance & income" },
        { doc: "Income Tax Return", required: true, notes: "Last 2 years or employment letter" },
        { doc: "Proof of Accommodation", required: true, notes: "Hotel booking or invitation letter" },
        { doc: "Flight Booking", required: true, notes: "Confirmed roundtrip tickets" },
        { doc: "Travel Itinerary", required: true, notes: "Day-by-day planned activities" },
        { doc: "Certificate of Employment", required: false, notes: "If employed" },
        { doc: "Business Documents", required: false, notes: "If self-employed" },
        { doc: "Invitation Letter", required: false, notes: "If visiting friends/family" }
      ]
    },
    canada: {
      country: "Canada",
      flag: "🇨🇦",
      visaType: "Visitor Visa",
      processingTime: "15-25 days",
      fee: "₱6,200",
      duration: "6 months",
      documents: [
        { doc: "Valid Passport", required: true, notes: "Valid throughout stay" },
        { doc: "Completed IMM0008 Form", required: true, notes: "Application for Visitor Visa" },
        { doc: "Passport Photo", required: true, notes: "45x35 mm, color, white background" },
        { doc: "Bank Statements", required: true, notes: "3-6 months proof of funds" },
        { doc: "Proof of Income", required: true, notes: "Tax returns or employment letter" },
        { doc: "Letter of Support (if applicable)", required: false, notes: "From sponsor if visiting family" },
        { doc: "Travel Itinerary", required: true, notes: "Dates and places to visit" },
        { doc: "Flight Booking", required: true, notes: "Confirmed tickets" },
        { doc: "Hotel Booking", required: true, notes: "Accommodation reservation" },
        { doc: "Employment Letter", required: false, notes: "Current employment status" },
        { doc: "Educational Documents", required: false, notes: "If student" },
        { doc: "Medical Exam", required: false, notes: "If requested by IRCC" }
      ]
    },
    skorea: {
      country: "South Korea",
      flag: "🇰🇷",
      visaType: "Tourist / Single Entry Visa",
      processingTime: "5-10 days",
      fee: "₱3,000",
      duration: "90 days",
      documents: [
        { doc: "Valid Passport", required: true, notes: "6+ months validity" },
        { doc: "Completed Visa Application Form", required: true, notes: "Korean embassy form" },
        { doc: "Passport-Size Photo", required: true, notes: "4x6 cm, white background" },
        { doc: "Bank Statement", required: true, notes: "Recent statement showing balance" },
        { doc: "Financial Document", required: true, notes: "Proof of funds for trip" },
        { doc: "Hotel Reservation", required: true, notes: "Confirmed booking" },
        { doc: "Flight Booking", required: true, notes: "Roundtrip confirmation" },
        { doc: "Travel Itinerary", required: true, notes: "Schedule of activities" },
        { doc: "Employment Letter", required: false, notes: "Optional but strengthens application" },
        { doc: "Income Tax Return", required: false, notes: "Optional - shows stability" }
      ]
    }
  };

  const handleSelectCountry = (countryKey) => {
    const requirements = countryRequirements[countryKey];
    setSelectedCountry(countryKey);
    setChecklist(requirements);
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF generation will be implemented with a PDF library (jsPDF/pdfkit)");
  };

  const handleSendEmail = () => {
    // In a real app, this would send the checklist via email
    alert("Email will be sent to client with checklist attached");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Automated Document Checklist Generator</h2>
        <p className="text-slate-600">Select destination country to auto-generate required documents checklist</p>
      </div>

      {/* Country Selection Grid */}
      <div className="mb-12">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Select Destination Country</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(countryRequirements).map(([key, country]) => (
            <button
              key={key}
              onClick={() => handleSelectCountry(key)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedCountry === key
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <p className="text-2xl mb-2">{country.flag}</p>
              <p className="font-bold text-slate-900">{country.country}</p>
              <p className="text-xs text-slate-600 mt-1">{country.visaType}</p>
              <p className="text-xs text-emerald-700 font-semibold mt-2">{country.processingTime}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Checklist Display */}
      {checklist && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    {checklist.flag} {checklist.country} - Document Checklist
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-2">{checklist.visaType}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-slate-600">Fee</p>
                  <p className="font-bold text-slate-900">{checklist.fee}</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-slate-600">Processing Time</p>
                  <p className="font-bold text-slate-900">{checklist.processingTime}</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-slate-600">Duration</p>
                  <p className="font-bold text-slate-900">{checklist.duration}</p>
                </div>
                <div className="p-3 bg-white rounded border border-blue-200">
                  <p className="text-xs text-slate-600">Total Documents</p>
                  <p className="font-bold text-slate-900">{checklist.documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checklist.documents.map((doc, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {doc.required ? (
                          <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">*</div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs">○</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{doc.doc}</p>
                          {doc.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">REQUIRED</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{doc.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-5 h-5" />
                Important Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-amber-900">
              <div className="p-3 bg-white rounded border border-amber-200">
                <p className="font-semibold mb-1">📋 Document Preparation</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• All documents must be ORIGINAL or officially certified copies</li>
                  <li>• Make 2-3 copies of each document for backup</li>
                  <li>• All documents must be in ENGLISH or have certified translations</li>
                  <li>• Arrange documents in the order specified above</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded border border-amber-200">
                <p className="font-semibold mb-1">📸 Photo Requirements</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Professional quality, white background</li>
                  <li>• No sunglasses or excessive makeup</li>
                  <li>• Passport-style photos taken within 3 months</li>
                  <li>• Print on white glossy photo paper</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded border border-amber-200">
                <p className="font-semibold mb-1">🏦 Financial Documents</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>• Bank statements must show regular income deposits</li>
                  <li>• Minimum balance: ₱50,000+ (varies by country)</li>
                  <li>• Include all pages even if blank/unused</li>
                  <li>• Must be within 3 months of application date</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={handleDownloadPDF}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download as PDF
            </Button>
            <Button
              onClick={handleSendEmail}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Send to Client Email
            </Button>
          </div>
        </div>
      )}

      {/* Info Section */}
      {!checklist && (
        <Card className="bg-slate-50 border-slate-300">
          <CardContent className="pt-6">
            <div className="text-center text-slate-600">
              <p className="mb-4">👆 Select a country above to view required documents and generate a custom checklist</p>
              <p className="text-sm">The system will automatically create a PDF checklist tailored to that specific destination's visa requirements.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}