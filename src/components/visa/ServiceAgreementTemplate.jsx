import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export default function ServiceAgreementTemplate() {
  const [clientData, setClientData] = useState({
    clientName: "",
    passportNo: "",
    destination: ""
  });

  const [showPreview, setShowPreview] = useState(true);

  const handleInputChange = (field, value) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Visa Service Agreement Template</h2>
        <p className="text-slate-600">Professional service agreement for visa assistance clients</p>
      </div>

      {/* Form Section */}
      <Card className="mb-8 bg-blue-50 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Client Full Name</label>
              <input
                type="text"
                placeholder="Enter client name"
                value={clientData.clientName}
                onChange={(e) => handleInputChange("clientName", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Passport Number</label>
              <input
                type="text"
                placeholder="Enter passport number"
                value={clientData.passportNo}
                onChange={(e) => handleInputChange("passportNo", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1">Destination Country</label>
              <input
                type="text"
                placeholder="Enter destination country"
                value={clientData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPreview(true)}
                className={showPreview ? "bg-blue-600" : "bg-slate-400"}
              >
                Preview
              </Button>
              <Button
                onClick={() => setShowPreview(false)}
                className={!showPreview ? "bg-blue-600" : "bg-slate-400"}
              >
                Edit Template
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 ml-auto flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && (
        <Card className="bg-white border-2 border-slate-200">
          <CardContent className="pt-8">
            {/* Document */}
            <div className="space-y-6 font-serif text-sm leading-relaxed">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-400 pb-6">
                <p className="text-2xl font-bold text-slate-900">GC TRAVEL & TOURS</p>
                <p className="text-sm text-slate-600 mt-1">Tourist Visa Assistance Service</p>
                <p className="text-sm text-slate-600">Block 12, Lot 8, Kapatiran Village, Pasong Buaya 2</p>
                <p className="text-sm text-slate-600">Imus, Cavite 4103, Philippines</p>
                <p className="text-sm text-slate-600">📞 +63 915 440 1150 | 📧 info@gctravelandtours.com</p>
              </div>

              {/* Title */}
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">SERVICE AGREEMENT</p>
                <p className="text-sm text-slate-600 mt-2">Visa Assistance Services</p>
              </div>

              {/* Agreement Body */}
              <div className="space-y-4">
                <div>
                  <p className="font-bold text-slate-900">AGREEMENT DATE: <span className="font-normal">_____________</span></p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">1. PARTIES</p>
                  <div className="ml-4 space-y-2">
                    <p><span className="font-semibold">Service Provider:</span> GC Travel & Tours Agency, represented by authorized personnel</p>
                    <p><span className="font-semibold">Client Name:</span> {clientData.clientName || "_________________________"}</p>
                    <p><span className="font-semibold">Passport Number:</span> {clientData.passportNo || "_________________________"}</p>
                    <p><span className="font-semibold">Destination Country:</span> {clientData.destination || "_________________________"}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">2. SCOPE OF SERVICES</p>
                  <div className="ml-4 space-y-2 text-justify">
                    <p>GC Travel & Tours provides <span className="font-semibold">VISA ASSISTANCE SERVICES ONLY</span>. Our services include:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Document checklist preparation based on destination country</li>
                      <li>• Document review and completeness verification</li>
                      <li>• Visa application form completion assistance</li>
                      <li>• Embassy/Consulate appointment scheduling</li>
                      <li>• Application submission coordination</li>
                      <li>• Status tracking and monitoring</li>
                      <li>• Client communication and follow-up support</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">3. VISA APPROVAL - DISCLAIMER</p>
                  <div className="ml-4 space-y-2 text-justify">
                    <p className="font-semibold text-red-700">⚠️ IMPORTANT:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Visa approval/denial decision is <span className="font-bold">solely at the discretion of the Embassy or Consulate</span></li>
                      <li>• GC Travel & Tours does NOT guarantee visa approval</li>
                      <li>• GC Travel & Tours is NOT a sponsor or guarantor of the visa application</li>
                      <li>• GC Travel & Tours is NOT liable for visa denial decisions or embassy delays</li>
                      <li>• The decision criteria and requirements may change without notice</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">4. FEES AND PAYMENTS</p>
                  <div className="ml-4 space-y-2">
                    <table className="w-full border-collapse border border-slate-400 text-sm">
                      <tbody>
                        <tr className="bg-slate-100">
                          <td className="border border-slate-400 p-2 font-semibold">Embassy Visa Fee</td>
                          <td className="border border-slate-400 p-2 text-right">₱ _________</td>
                          <td className="border border-slate-400 p-2">Government-imposed, non-refundable</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-400 p-2 font-semibold">GC Travel Service Fee</td>
                          <td className="border border-slate-400 p-2 text-right">₱ _________</td>
                          <td className="border border-slate-400 p-2">Non-refundable after document review</td>
                        </tr>
                        <tr className="bg-slate-100 font-bold">
                          <td className="border border-slate-400 p-2">TOTAL AMOUNT DUE</td>
                          <td className="border border-slate-400 p-2 text-right">₱ _________</td>
                          <td className="border border-slate-400 p-2">Due upon signing</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="mt-3"><span className="font-semibold">Payment Methods Accepted:</span> Cash, Credit Card, Bank Transfer</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">5. REFUND POLICY</p>
                  <div className="ml-4 space-y-2 text-justify">
                    <ul className="space-y-1">
                      <li>• <span className="font-semibold">Embassy Fees:</span> NON-REFUNDABLE (government-imposed)</li>
                      <li>• <span className="font-semibold">Service Fee (Before Document Review):</span> 80% refundable within 48 hours</li>
                      <li>• <span className="font-semibold">Service Fee (After Document Review):</span> NON-REFUNDABLE</li>
                      <li>• <span className="font-semibold">Upon Visa Denial:</span> Service fee is NOT refunded (we provided the service; denial is embassy decision)</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">6. CLIENT RESPONSIBILITIES</p>
                  <div className="ml-4 space-y-2">
                    <ul className="space-y-1">
                      <li>• Client will provide complete and accurate information</li>
                      <li>• All documents submitted are authentic and genuine</li>
                      <li>• Client accepts responsibility for document authenticity</li>
                      <li>• Client will attend all scheduled appointments</li>
                      <li>• Client will cooperate fully with the visa application process</li>
                      <li>• Client acknowledges all information provided is truthful</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">7. DATA PRIVACY & SECURITY</p>
                  <div className="ml-4 space-y-2 text-justify">
                    <p>GC Travel & Tours commits to:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Secure storage of all client documents (passports, bank statements, etc.)</li>
                      <li>• Confidentiality of sensitive personal and financial information</li>
                      <li>• Compliance with data protection laws (Data Privacy Act 2012)</li>
                      <li>• Documents will be destroyed upon visa completion or upon client request</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">8. COMMUNICATION & FOLLOW-UP</p>
                  <div className="ml-4 space-y-2">
                    <p>GC Travel & Tours will communicate with client via:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Email: {clientData.clientEmail || "_______________"}</li>
                      <li>• Mobile: _____________</li>
                      <li>• Response time: Within 24 business hours</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">9. LIMITATIONS OF LIABILITY</p>
                  <div className="ml-4 space-y-2 text-justify">
                    <p>GC Travel & Tours is not liable for:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• Visa denial decisions by embassy/consulate</li>
                      <li>• Delays in embassy processing</li>
                      <li>• Changes in visa requirements or policy</li>
                      <li>• Loss or damage to documents during submission</li>
                      <li>• Unforeseen circumstances or force majeure events</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">10. TERMINATION</p>
                  <div className="ml-4 space-y-2">
                    <p>Client may terminate this agreement in writing. Service fee refund will be determined per Section 5 (Refund Policy).</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 mb-2">11. ACKNOWLEDGMENT & AGREEMENT</p>
                  <div className="ml-4 space-y-3 text-justify bg-yellow-50 border border-yellow-300 p-4 rounded">
                    <p>By signing below, I (the Client) confirm that:</p>
                    <ul className="space-y-2 ml-4">
                      <li>✓ I understand GC Travel & Tours provides visa ASSISTANCE ONLY</li>
                      <li>✓ Visa approval is NOT guaranteed and is embassy's sole decision</li>
                      <li>✓ All fees are clearly understood and accepted</li>
                      <li>✓ All documents I provide are authentic and accurate</li>
                      <li>✓ I have read and agree to all terms in this agreement</li>
                      <li>✓ I accept the refund policy as stated in Section 5</li>
                      <li>✓ I acknowledge the liability limitations in Section 9</li>
                    </ul>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-8 space-y-6">
                  <div>
                    <p className="font-bold text-slate-900 mb-4">CLIENT SIGNATURE:</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="border-b-2 border-slate-400 w-48 h-12 flex items-end justify-center"></p>
                        <p className="text-sm text-slate-600 mt-1">Client Signature</p>
                      </div>
                      <div>
                        <p className="border-b-2 border-slate-400 w-48 h-12 flex items-end justify-center"></p>
                        <p className="text-sm text-slate-600 mt-1">Date</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">Printed Name: {clientData.clientName || "_______________________________"}</p>
                  </div>

                  <div className="border-t-2 border-slate-400 pt-6">
                    <p className="font-bold text-slate-900 mb-4">GC TRAVEL & TOURS REPRESENTATIVE:</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="border-b-2 border-slate-400 w-48 h-12 flex items-end justify-center"></p>
                        <p className="text-sm text-slate-600 mt-1">Authorized Signature</p>
                      </div>
                      <div>
                        <p className="border-b-2 border-slate-400 w-48 h-12 flex items-end justify-center"></p>
                        <p className="text-sm text-slate-600 mt-1">Date</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">Printed Name: _______________________________</p>
                    <p className="text-sm">Position: GC Travel & Tours Personnel</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-slate-400 mt-8 pt-4 text-center text-xs text-slate-600">
                  <p>This agreement is effective upon both parties' signatures</p>
                  <p>A copy of this agreement will be provided to the client</p>
                  <p>GC Travel & Tours | Imus, Cavite, Philippines</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
        <CardHeader>
          <CardTitle className="text-green-900">📋 Important Notes on Service Agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded border border-green-200">
            <p className="font-semibold text-slate-900">Why This Agreement Matters</p>
            <p className="text-sm text-slate-600 mt-1">Protects both GC Travel and client by clearly stating expectations, fees, and limitations</p>
          </div>
          <div className="p-3 bg-white rounded border border-green-200">
            <p className="font-semibold text-slate-900">Key Protection: "Visa Assistance Only"</p>
            <p className="text-sm text-slate-600 mt-1">This clearly states you're NOT guaranteeing approval, protecting against false claims</p>
          </div>
          <div className="p-3 bg-white rounded border border-green-200">
            <p className="font-semibold text-slate-900">Liability Limitation Clause</p>
            <p className="text-sm text-slate-600 mt-1">Protects GC Travel from liability if visa is denied (not your responsibility)</p>
          </div>
          <div className="p-3 bg-white rounded border border-green-200">
            <p className="font-semibold text-slate-900">Refund Policy</p>
            <p className="text-sm text-slate-600 mt-1">Clearly states service fees are non-refundable after document review starts</p>
          </div>
          <div className="p-3 bg-white rounded border border-green-200">
            <p className="font-semibold text-slate-900">Client Responsibility</p>
            <p className="text-sm text-slate-600 mt-1">Client must confirm all documents are authentic (prevents legal issues)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}