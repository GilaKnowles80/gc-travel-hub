import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Eye, Building2, BadgeCheck, Calendar, Hash, X } from "lucide-react";

const DOCUMENTS = [
  {
    title: "DTI Certificate of Business Name Registration",
    subtitle: "Department of Trade and Industry",
    image_url:
      "https://media.base44.com/images/public/698ba6f12468e8d5e020a7b5/f8f6b76e9_Argie-CDTI.jpeg",
    business_name: "ARGIE-C TRAVEL AND TOURS AGENCY (NATIONAL)",
    owner: "GILA ARAYAN CAIN",
    registration_no: "Business Name No. 8068420",
    validity: "March 26, 2026 to March 26, 2031",
    issued_on: "March 26, 2026",
    icon: Building2,
    accent: "from-blue-500 to-indigo-600",
    description:
      "Official DTI registration certifying Argie-C Travel and Tours Agency as a registered business name under Act 3883, as amended.",
  },
  {
    title: "BIR Certificate of Registration (Form 2303)",
    subtitle: "Bureau of Internal Revenue",
    image_url:
      "https://media.base44.com/images/public/698ba6f12468e8d5e020a7b5/e29ce9ae8_Argie-CTravelandToursCOR.jpeg",
    business_name: "ARGIE-C TRAVEL AND TOURS AGENCY",
    owner: "CAIN, GILA ARAYAN",
    registration_no: "TIN: 940-103-656-00001",
    validity: "Registration Date: March 30, 2026",
    issued_on: "March 30, 2026",
    icon: BadgeCheck,
    accent: "from-emerald-500 to-teal-600",
    description:
      "BIR Form 2303 confirming registration as a single proprietorship engaged in travel agency activities (PSIC 79110).",
  },
];

export default function BusinessDocuments({ compact = false }) {
  const [preview, setPreview] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Business Documents</h2>
        <p className="text-slate-600 mt-1">
          Official registration certificates for Argie-C Travel and Tours Agency
        </p>
      </div>

      <div className={`grid gap-6 ${compact ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
        {DOCUMENTS.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.title} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r ${doc.accent}`} />
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${doc.accent} text-white shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base leading-tight">{doc.title}</CardTitle>
                  <p className="text-sm text-slate-500 mt-0.5">{doc.subtitle}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 bg-slate-50" onClick={() => setPreview(doc)}>
                  <img
                    src={doc.image_url}
                    alt={doc.title}
                    className="w-full h-48 object-contain bg-white"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-slate-800 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      View Document
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Business Name</p>
                      <p className="font-medium text-slate-800">{doc.business_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Registration No.</p>
                      <p className="font-medium text-slate-800">{doc.registration_no}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Validity</p>
                      <p className="font-medium text-slate-800">{doc.validity}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{doc.description}</p>

                <div className="flex gap-2 pt-1">
                  <a
                    href={doc.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Open
                  </a>
                  <a
                    href={doc.image_url}
                    download
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setPreview(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={preview.image_url}
            alt={preview.title}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}