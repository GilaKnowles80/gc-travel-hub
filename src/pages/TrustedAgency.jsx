import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/pages/utils";
import { Award, FileCheck, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrustedAgency() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <Link to={createPageUrl("Home")} className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <Award className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Trusted & Licensed Agency</h1>
          <p className="text-lg text-slate-600">Years of experience crafting perfect travel experiences</p>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/5a42ec8a1_L6.jpg"
                  alt="GC Travel and Tours Agency Logo"
                  className="w-48 h-48 object-contain"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">GC Travel and Tours Agency</h2>
                  <p className="text-slate-700 mb-2"><strong>Established:</strong> 2015</p>
                  <p className="text-slate-700 mb-2"><strong>Owner:</strong> Gila Cain Knowles</p>
                  <p className="text-slate-700 mb-2"><strong>Business Type:</strong> Licensed Travel Agency & Tour Operator</p>
                  <p className="text-slate-700"><strong>Specialization:</strong> Domestic & International Travel Planning</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-blue-600" />
                Business Licenses & Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/c2719c473_L1.jpg"
                    alt="DTI Business Registration Certificate"
                    className="w-full rounded-lg shadow-md border border-slate-200 mb-3"
                  />
                  <h4 className="font-semibold text-slate-900">DTI Business Registration</h4>
                  <p className="text-sm text-slate-600">Certificate of Business Name Registration</p>
                  <p className="text-sm text-slate-700 mt-1"><strong>Business No.:</strong> 3956850</p>
                  <p className="text-sm text-slate-700"><strong>Valid:</strong> June 22, 2022 - June 22, 2027</p>
                </div>

                <div>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/497818977_L4.jpg"
                    alt="Barangay Business Permit"
                    className="w-full rounded-lg shadow-md border border-slate-200 mb-3"
                  />
                  <h4 className="font-semibold text-slate-900">Barangay Business Permit</h4>
                  <p className="text-sm text-slate-600">Pasong Buaya II, Imus City, Cavite</p>
                  <p className="text-sm text-slate-700 mt-1"><strong>Plate No.:</strong> 29018AGLE</p>
                  <p className="text-sm text-slate-700"><strong>Registered:</strong> 2025</p>
                </div>

                <div>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/b5bf0537e_L2.jpg"
                    alt="Barangay Clearance"
                    className="w-full rounded-lg shadow-md border border-slate-200 mb-3"
                  />
                  <h4 className="font-semibold text-slate-900">Barangay Clearance</h4>
                  <p className="text-sm text-slate-600">Location: Block 12, Lot 8, Kapatiran Village</p>
                  <p className="text-sm text-slate-700 mt-1"><strong>Control #:</strong> 338-25</p>
                  <p className="text-sm text-slate-700"><strong>Issued:</strong> June 27, 2025</p>
                </div>

                <div>
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/068f902f0_L5.jpg"
                    alt="Business Card"
                    className="w-full rounded-lg shadow-md border border-slate-200 mb-3"
                  />
                  <h4 className="font-semibold text-slate-900">Business Information</h4>
                  <p className="text-sm text-slate-700 mt-1"><strong>TIN:</strong> 940-103-656-0000</p>
                  <p className="text-sm text-slate-700"><strong>Business Permit No.:</strong> 395-6850</p>
                  <p className="text-sm text-slate-700"><strong>Contact:</strong> +63 915 440 1150</p>
                  <p className="text-sm text-slate-700"><strong>Email:</strong> gctravelandtours2021@gmail.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="w-6 h-6 text-purple-600" />
                Professional Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/c7067682d_L3.jpg"
                  alt="Biyaheko Training Certificate"
                  className="w-64 rounded-lg shadow-md border border-slate-200"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">Biyaheko Portal Training</h4>
                  <p className="text-slate-700 mb-2">
                    Certificate of Completion for <strong>Basic Portal Training</strong> course
                  </p>
                  <p className="text-sm text-slate-600">
                    Completed September 29, 2025 through Biyaheko Online Training. Certified by Sales Manager Cellene May Martin.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Biyaheko Accredited Partner</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                Verified Supplier Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ba6f12468e8d5e020a7b5/c4f7c7efa_L7.jpg"
                alt="Supplier Partnerships"
                className="w-full rounded-lg shadow-md border border-slate-200 mb-4"
              />
              <p className="text-slate-700 mb-3">
                GC Travel and Tours maintains official partnerships with leading travel suppliers across multiple categories:
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Airlines</h4>
                  <p className="text-sm text-slate-700">
                    Cebu Pacific, Philippine Airlines, AirAsia, Cathay Pacific, ANA, Air Canada, Etihad, Qatar, Skyjet
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Hotels</h4>
                  <p className="text-sm text-slate-700">
                    Shangri-La, Belmont, Red Doorz, Go Hotels, La Carmela, Seda
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Transport</h4>
                  <p className="text-sm text-slate-700">
                    2GO Travel, OceanJet, Philtranco, Bicol Isarog, Genesis, Cherry, Peñafrancia, Pintados
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4 italic">
                Powered by Biyaheko - Official booking platform for transportation, hotels, and travel services in the Philippines.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-3">Why Trust GC Travel and Tours?</h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>10+ Years of Experience</strong> serving travelers since 2015</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Fully Licensed & Registered</strong> with all Philippine government agencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Verified Partnerships</strong> with major airlines, hotels, and transport providers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Certified by Biyaheko</strong> as an accredited travel service provider</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Local Presence</strong> with physical office in Imus, Cavite for in-person support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="text-center pt-8">
            <p className="text-slate-600 mb-4">Have questions about our credentials?</p>
            <Link to={createPageUrl("Contact")}>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}