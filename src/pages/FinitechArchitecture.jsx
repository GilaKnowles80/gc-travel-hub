import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Share2, Lock, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinitechArchitecture() {
  const [expandedSection, setExpandedSection] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">GC Travel Fintech Architecture</h1>
          <p className="text-lg text-slate-600">Enterprise-level technical design for wallet + payment processing</p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="architecture" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">System Architecture Overview</h2>
              <div className="space-y-6">
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-3">Presentation Layer</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {['Web App (React)', 'Mobile App (React)', 'Admin Panel', 'Supplier Portal'].map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded border border-blue-200 text-center text-sm font-medium text-blue-900">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-3">API Gateway (Base44)</h3>
                  <ul className="text-sm text-purple-900 space-y-2">
                    <li>✓ Auth & Session Management (JWT)</li>
                    <li>✓ Rate Limiting (100 req/min per user)</li>
                    <li>✓ CORS & Security Headers</li>
                    <li>✓ Request Logging</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Core Services
                    </h3>
                    <ul className="text-sm text-amber-900 space-y-1">
                      <li>• Wallet Service</li>
                      <li>• Card Service</li>
                      <li>• KYC Service</li>
                      <li>• Transfer Service</li>
                      <li>• Booking Service</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4" /> Payment Integrations
                    </h3>
                    <ul className="text-sm text-green-900 space-y-1">
                      <li>• PayMongo (Primary)</li>
                      <li>• Stripe (Fallback)</li>
                      <li>• ExchangeRate API</li>
                      <li>• Banking Partners</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
                  <h3 className="font-bold text-indigo-900 mb-3">Transaction Processor</h3>
                  <ul className="text-sm text-indigo-900 space-y-2">
                    <li>✓ Queue Management (Redis Bull)</li>
                    <li>✓ Webhook Processing (PayMongo, Stripe)</li>
                    <li>✓ Reconciliation Engine (hourly)</li>
                    <li>✓ Retry Logic (exponential backoff, 3 max)</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-rose-50 to-rose-100 p-6 rounded-lg border border-rose-200">
                    <h3 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Data Layer
                    </h3>
                    <ul className="text-sm text-rose-900 space-y-1">
                      <li>• PostgreSQL (Primary)</li>
                      <li>• Redis Cache (15 min TTL)</li>
                      <li>• Event Store (audit log)</li>
                      <li>• S3 (documents)</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-6 rounded-lg border border-cyan-200">
                    <h3 className="font-bold text-cyan-900 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Security Layer
                    </h3>
                    <ul className="text-sm text-cyan-900 space-y-1">
                      <li>• AES-256 Encryption</li>
                      <li>• Card Tokenization</li>
                      <li>• 2FA Authentication</li>
                      <li>• Fraud Detection (ML)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Core Microservices</h2>
              <div className="space-y-6">
                
                <div className="border-l-4 border-blue-500 pl-6 py-4">
                  <h3 className="font-bold text-slate-900 mb-3">Wallet Service</h3>
                  <div className="bg-slate-50 p-4 rounded font-mono text-sm space-y-2">
                    <div><span className="text-green-600">POST</span>   /wallet/create</div>
                    <div><span className="text-blue-600">GET</span>    /wallet/{'{user_id}'}</div>
                    <div><span className="text-green-600">POST</span>   /wallet/deposit</div>
                    <div><span className="text-green-600">POST</span>   /wallet/withdraw</div>
                    <div><span className="text-green-600">POST</span>   /wallet/transfer</div>
                    <div><span className="text-blue-600">GET</span>    /wallet/transactions</div>
                  </div>
                </div>

                <div className="border-l-4 border-purple-500 pl-6 py-4">
                  <h3 className="font-bold text-slate-900 mb-3">Card Service</h3>
                  <div className="bg-slate-50 p-4 rounded font-mono text-sm space-y-2">
                    <div><span className="text-green-600">POST</span>   /cards/create</div>
                    <div><span className="text-blue-600">GET</span>    /cards/{'{user_id}'}</div>
                    <div><span className="text-green-600">POST</span>   /cards/{'{card_id}'}/toggle</div>
                    <div><span className="text-green-600">POST</span>   /cards/{'{card_id}'}/limit</div>
                  </div>
                </div>

                <div className="border-l-4 border-amber-500 pl-6 py-4">
                  <h3 className="font-bold text-slate-900 mb-3">KYC Service</h3>
                  <div className="bg-slate-50 p-4 rounded font-mono text-sm space-y-2">
                    <div><span className="text-green-600">POST</span>   /kyc/submit</div>
                    <div><span className="text-blue-600">GET</span>    /kyc/status/{'{user_id}'}</div>
                    <div><span className="text-green-600">POST</span>   /kyc/approve (admin)</div>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-6 py-4">
                  <h3 className="font-bold text-slate-900 mb-3">Transfer Service</h3>
                  <div className="bg-slate-50 p-4 rounded font-mono text-sm space-y-2">
                    <div><span className="text-green-600">POST</span>   /transfer/p2p</div>
                    <div><span className="text-green-600">POST</span>   /transfer/booking</div>
                    <div><span className="text-green-600">POST</span>   /transfer/bank</div>
                    <div><span className="text-green-600">POST</span>   /transfer/gcash</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Data Flow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Transaction Data Flows</h2>
              <div className="space-y-8">
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4">Add Funds (Bank Transfer)</h3>
                  <div className="space-y-3 text-sm text-blue-900 font-mono">
                    <div>1. User selects "Add Funds" → Bank Transfer</div>
                    <div className="ml-4">2. Verify bank account ownership</div>
                    <div className="ml-4">3. Create BankTransfer record (pending)</div>
                    <div className="ml-4">4. Redirect to PayMongo payment</div>
                    <div className="ml-4">5. User completes payment</div>
                    <div className="ml-4">6. Webhook: PayMongo confirms</div>
                    <div className="ml-4">7. Update Wallet balance + log transaction</div>
                    <div className="ml-4">8. Send confirmation email</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-4">Create Virtual Card</h3>
                  <div className="space-y-3 text-sm text-purple-900 font-mono">
                    <div>1. User POST /cards/create {'{type: virtual}'}</div>
                    <div className="ml-4">2. Validate KYC status</div>
                    <div className="ml-4">3. Call PayMongo API → get sub-wallet ID</div>
                    <div className="ml-4">4. Store in WalletCard entity</div>
                    <div className="ml-4">5. Return masked card (****4242)</div>
                    <div className="ml-4">6. Card active immediately</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-4">P2P Transfer</h3>
                  <div className="space-y-3 text-sm text-green-900 font-mono">
                    <div>1. Sender POST /transfer/p2p {'{recipient, amount}'}</div>
                    <div className="ml-4">2. Verify recipient exists in system</div>
                    <div className="ml-4">3. Check sender balance ≥ amount</div>
                    <div className="ml-4">4. Atomic transaction (lock both wallets)</div>
                    <div className="ml-4">5. Debit sender wallet</div>
                    <div className="ml-4">6. Credit recipient wallet</div>
                    <div className="ml-4">7. Log transaction with reference ID</div>
                    <div className="ml-4">8. Send SMS to both parties</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-4">Travel Booking Payment</h3>
                  <div className="space-y-3 text-sm text-amber-900 font-mono">
                    <div>1. User at Flight Checkout → Select "Pay with Wallet"</div>
                    <div className="ml-4">2. Fetch live exchange rate (USD → PHP)</div>
                    <div className="ml-4">3. Apply 2% FX markup</div>
                    <div className="ml-4">4. Show breakdown: Flight ₱X + FX fee ₱Y</div>
                    <div className="ml-4">5. User confirms payment</div>
                    <div className="ml-4">6. Call /transfer/booking with booking_id</div>
                    <div className="ml-4">7. Debit wallet (atomic)</div>
                    <div className="ml-4">8. Update booking.payment_received = true</div>
                    <div className="ml-4">9. Trigger booking confirmation email</div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Deployment Tab */}
          <TabsContent value="deployment" className="space-y-6">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Infrastructure & Deployment</h2>
              <div className="space-y-6">
                
                <div className="bg-slate-100 p-6 rounded-lg border border-slate-300">
                  <h3 className="font-bold text-slate-900 mb-4">Cloud Infrastructure</h3>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li>✓ <strong>Cloud Provider:</strong> AWS / GCP / DigitalOcean</li>
                    <li>✓ <strong>CDN:</strong> CloudFront (edge caching)</li>
                    <li>✓ <strong>DDoS Protection:</strong> WAF rules enabled</li>
                    <li>✓ <strong>Load Balancer:</strong> Auto-scaling (2-10 instances)</li>
                    <li>✓ <strong>Orchestration:</strong> Kubernetes / Deno Deploy</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-100 p-6 rounded-lg border border-slate-300">
                    <h3 className="font-bold text-slate-900 mb-4">Database</h3>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li>✓ PostgreSQL (Primary)</li>
                      <li>✓ Automated backups (daily)</li>
                      <li>✓ Read replicas (2+)</li>
                      <li>✓ Sharding by user_id</li>
                      <li>✓ Encryption at rest</li>
                    </ul>
                  </div>

                  <div className="bg-slate-100 p-6 rounded-lg border border-slate-300">
                    <h3 className="font-bold text-slate-900 mb-4">Cache & Queue</h3>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li>✓ Redis Cluster</li>
                      <li>✓ Bull job queue</li>
                      <li>✓ Pub/Sub channels</li>
                      <li>✓ 15 min TTL</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-100 p-6 rounded-lg border border-slate-300">
                  <h3 className="font-bold text-slate-900 mb-4">Disaster Recovery</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded border border-slate-300">
                      <p className="text-xs font-bold text-slate-600">RTO</p>
                      <p className="text-lg font-bold text-slate-900">4 hours</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-300">
                      <p className="text-xs font-bold text-slate-600">RPO</p>
                      <p className="text-lg font-bold text-slate-900">1 hour</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-300">
                      <p className="text-xs font-bold text-slate-600">Backup</p>
                      <p className="text-lg font-bold text-slate-900">Hourly</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-300">
                      <p className="text-xs font-bold text-slate-600">Failover</p>
                      <p className="text-lg font-bold text-slate-900">5 min</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 p-6 rounded-lg border border-slate-300">
                  <h3 className="font-bold text-slate-900 mb-4">Monitoring</h3>
                  <ul className="text-sm text-slate-700 space-y-2">
                    <li>✓ Real-time dashboards (Grafana)</li>
                    <li>✓ Metrics: Transaction volume, success rate, latency</li>
                    <li>✓ Alerts: Anomalies, failures, performance</li>
                    <li>✓ Logs: 7-year retention (audit compliance)</li>
                    <li>✓ Tracing: Distributed request tracking</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Technology Stack */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Technology Stack</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Frontend</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• React 18</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Framer Motion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Backend</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Deno / Node.js</li>
                  <li>• PostgreSQL</li>
                  <li>• Redis</li>
                  <li>• Bull Queue</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Infrastructure</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Docker</li>
                  <li>• Kubernetes</li>
                  <li>• AWS/GCP</li>
                  <li>• Prometheus/ELK</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}