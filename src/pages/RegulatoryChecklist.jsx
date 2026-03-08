import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegulatoryChecklist() {
  const [checklist, setChecklist] = useState({
    bsp: [
      { id: 1, item: 'BSP Remittance Licensing (if applicable)', status: 'pending', timeline: 'Month 6-12' },
      { id: 2, item: 'EMI License Application (Phase 2)', status: 'pending', timeline: 'Month 12-24' },
      { id: 3, item: 'Money Transmitter Registration', status: 'pending', timeline: 'Month 3-6' },
      { id: 4, item: 'BIN Application (Phase 2)', status: 'pending', timeline: 'Month 12-24' },
    ],
    kyc: [
      { id: 5, item: 'KYC Form Implementation (user info + docs)', status: 'completed', timeline: 'Now' },
      { id: 6, item: 'AML Screening (database integration)', status: 'in-progress', timeline: 'Month 1-2' },
      { id: 7, item: 'Enhanced Due Diligence (high-risk users)', status: 'pending', timeline: 'Month 2-3' },
      { id: 8, item: 'Continuous Monitoring (transaction surveillance)', status: 'pending', timeline: 'Month 3-4' },
    ],
    security: [
      { id: 9, item: 'PCI-DSS Compliance (v3.2.1)', status: 'in-progress', timeline: 'Month 1-3' },
      { id: 10, item: 'Data Encryption (AES-256)', status: 'completed', timeline: 'Now' },
      { id: 11, item: 'Penetration Testing (annual)', status: 'pending', timeline: 'Month 6' },
      { id: 12, item: '2FA Implementation', status: 'completed', timeline: 'Now' },
      { id: 13, item: 'Tokenization (Card data)', status: 'in-progress', timeline: 'Month 1-2' },
    ],
    aml: [
      { id: 14, item: 'AMLC Reporting (suspicious transactions)', status: 'pending', timeline: 'Month 2-3' },
      { id: 15, item: 'Currency Transaction Reports (CTR)', status: 'pending', timeline: 'Month 2-3' },
      { id: 16, item: 'Sanctions Screening (OFAC, etc.)', status: 'pending', timeline: 'Month 1-2' },
      { id: 17, item: 'Quarterly AML Audits', status: 'pending', timeline: 'Month 6+' },
    ],
    operations: [
      { id: 18, item: 'Audit Trail & Logging (7-year retention)', status: 'in-progress', timeline: 'Month 1' },
      { id: 19, item: 'Privacy Policy & Terms of Service', status: 'completed', timeline: 'Now' },
      { id: 20, item: 'Data Protection Impact Assessment (DPIA)', status: 'pending', timeline: 'Month 2' },
      { id: 21, item: 'Incident Response Plan', status: 'pending', timeline: 'Month 3' },
      { id: 22, item: 'Internal Controls & Policies', status: 'pending', timeline: 'Month 2-3' },
    ],
  });

  const toggleStatus = (key, id) => {
    setChecklist(prev => ({
      ...prev,
      [key]: prev[key].map(item =>
        item.id === id ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' } : item
      )
    }));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  const ChecklistItem = ({ item, category }) => (
    <div
      onClick={() => toggleStatus(category, item.id)}
      className={`border p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${getStatusColor(item.status)}`}
    >
      <div className="flex items-start gap-4">
        <div className="pt-1">{getStatusIcon(item.status)}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 mb-2">{item.item}</h4>
          <p className="text-sm text-slate-600">Timeline: {item.timeline}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
          item.status === 'completed' ? 'bg-green-200 text-green-800' :
          item.status === 'in-progress' ? 'bg-blue-200 text-blue-800' :
          'bg-yellow-200 text-yellow-800'
        }`}>
          {item.status.replace('-', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Philippine Regulatory Compliance Checklist
          </h1>
          <p className="text-lg text-slate-600">Complete roadmap for BSP, AML, KYC, and data security compliance</p>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Items', count: 22, color: 'bg-slate-100' },
            { label: 'Completed', count: 4, color: 'bg-green-100' },
            { label: 'In Progress', count: 3, color: 'bg-blue-100' },
            { label: 'Pending', count: 15, color: 'bg-yellow-100' },
          ].map((stat, i) => (
            <Card key={i} className={`p-6 ${stat.color}`}>
              <p className="text-slate-600 text-sm font-semibold mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.count}</p>
            </Card>
          ))}
        </div>

        {/* Main Checklist */}
        <Tabs defaultValue="bsp" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="bsp">BSP Licensing</TabsTrigger>
            <TabsTrigger value="kyc">KYC/AML</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="aml">AML Reporting</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="bsp">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">BSP & Licensing Requirements</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900"><strong>Phase 1 (Fast Track):</strong> Partner with PayMongo/Maya → sub-wallet issuance (no license required initially)</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-900"><strong>Phase 2 (Scale):</strong> Apply for EMI license → issue own BIN → direct Visa/Mastercard membership</p>
                </div>
                <div className="space-y-4 mt-6">
                  {checklist.bsp.map(item => (
                    <ChecklistItem key={item.id} item={item} category="bsp" />
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">KYC/AML Framework</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-sm text-purple-900"><strong>KYC Requirements:</strong></p>
                  <ul className="text-sm text-purple-900 ml-4 mt-2 space-y-1">
                    <li>• Full name, DOB, nationality, address</li>
                    <li>• Valid ID (passport, driver's license, national ID)</li>
                    <li>• Selfie + ID verification (facial recognition)</li>
                    <li>• TIN (Tax Identification Number)</li>
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm text-red-900"><strong>AML Screening:</strong></p>
                  <ul className="text-sm text-red-900 ml-4 mt-2 space-y-1">
                    <li>• Sanctions lists (OFAC, AMLC, UN, etc.)</li>
                    <li>• PEP (Politically Exposed Persons) screening</li>
                    <li>• Risk scoring (0-100)</li>
                    <li>• Continuous monitoring</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                {checklist.kyc.map(item => (
                  <ChecklistItem key={item.id} item={item} category="kyc" />
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Security & Data Protection</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                  <p className="text-sm text-indigo-900"><strong>PCI-DSS Compliance (v3.2.1):</strong></p>
                  <ul className="text-sm text-indigo-900 ml-4 mt-2 space-y-1">
                    <li>• Build & maintain secure network</li>
                    <li>• Protect card data (encryption + tokenization)</li>
                    <li>• Maintain vulnerability mgmt program</li>
                    <li>• Implement access control measures</li>
                    <li>• Regular monitoring & testing</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                {checklist.security.map(item => (
                  <ChecklistItem key={item.id} item={item} category="security" />
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="aml">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">AML Reporting (AMLC)</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <p className="text-sm text-orange-900"><strong>Reporting Obligations:</strong></p>
                  <ul className="text-sm text-orange-900 ml-4 mt-2 space-y-1">
                    <li>• <strong>STR (Suspicious Transaction Report):</strong> Within 5 days of detection</li>
                    <li>• <strong>CTR (Currency Transaction Report):</strong> For transactions ≥ PHP 500,000</li>
                    <li>• <strong>Quarterly AML Report:</strong> By 15th of following month</li>
                    <li>• <strong>Submission:</strong> Via AMLC e-filing system</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                {checklist.aml.map(item => (
                  <ChecklistItem key={item.id} item={item} category="aml" />
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="operations">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Operational Compliance</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-green-900"><strong>Key Requirements:</strong></p>
                  <ul className="text-sm text-green-900 ml-4 mt-2 space-y-1">
                    <li>• 7-year audit trail retention (immutable log)</li>
                    <li>• Hourly reconciliation with payment providers</li>
                    <li>• Monthly compliance reviews</li>
                    <li>• Annual external audit</li>
                    <li>• Quarterly risk assessment</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                {checklist.operations.map(item => (
                  <ChecklistItem key={item.id} item={item} category="operations" />
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Regulatory Roadmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Implementation Roadmap (24 Months)</h2>
            <div className="space-y-4">
              {[
                { month: 'Month 1-2', items: ['KYC form setup', 'AML database integration', 'Data encryption', '2FA implementation'] },
                { month: 'Month 2-3', items: ['PCI-DSS assessment', 'Tokenization (PayMongo)', 'Internal policies', 'AMLC reporting setup'] },
                { month: 'Month 3-6', items: ['Penetration testing', 'Money transmitter registration', 'BSP consultation', 'Risk assessment'] },
                { month: 'Month 6-12', items: ['BSP licensing application', 'External audit', 'Continuous monitoring', 'Quarterly AML reports'] },
                { month: 'Month 12-24 (Phase 2)', items: ['EMI license application', 'BIN issuance', 'Direct Visa/MC membership', 'International expansion'] },
              ].map((phase, i) => (
                <div key={i} className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3">{phase.month}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {phase.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-blue-900">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Key Contacts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Regulatory Contacts</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-2">Bangko Sentral ng Pilipinas (BSP)</h3>
                <p className="text-sm text-slate-600 mb-2">Financial Supervision Sector (FSS)</p>
                <p className="text-sm font-mono text-slate-600">Email: psdops@bsp.gov.ph</p>
                <p className="text-sm text-slate-600 mt-2">For: Licensing, regulations, inquiries</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-2">AMLC (Anti-Money Laundering Council)</h3>
                <p className="text-sm text-slate-600 mb-2">FinCEN equivalent for Philippines</p>
                <p className="text-sm font-mono text-slate-600">Website: amlc.gov.ph</p>
                <p className="text-sm text-slate-600 mt-2">For: AML reporting, STR, CTR submissions</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-2">BIR (Bureau of Internal Revenue)</h3>
                <p className="text-sm text-slate-600 mb-2">Tax registration & reporting</p>
                <p className="text-sm font-mono text-slate-600">Website: bir.gov.ph</p>
                <p className="text-sm text-slate-600 mt-2">For: Business registration, TIN</p>
              </div>
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-2">SEC (Securities & Exchange Commission)</h3>
                <p className="text-sm text-slate-600 mb-2">Company registration & compliance</p>
                <p className="text-sm font-mono text-slate-600">Website: sec.gov.ph</p>
                <p className="text-sm text-slate-600 mt-2">For: Corporate registration</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}