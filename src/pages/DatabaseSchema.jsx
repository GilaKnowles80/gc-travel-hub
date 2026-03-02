import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Key, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DatabaseSchema() {
  const [expandedTable, setExpandedTable] = useState('Wallet');

  const tables = {
    'Wallet': {
      description: 'User wallet accounts',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'user_email', type: 'VARCHAR(255)', fk: 'User.email', desc: 'User reference' },
        { name: 'balance', type: 'DECIMAL(18,2)', desc: 'Current balance in PHP' },
        { name: 'currency', type: 'VARCHAR(3)', desc: 'PHP (primary)' },
        { name: 'is_primary', type: 'BOOLEAN', default: 'true', desc: 'Primary wallet flag' },
        { name: 'status', type: 'ENUM', values: ['active', 'frozen', 'closed'], desc: 'Wallet status' },
        { name: 'created_date', type: 'TIMESTAMP', default: 'now()', desc: 'Creation date' },
        { name: 'updated_date', type: 'TIMESTAMP', desc: 'Last update' },
      ]
    },
    'WalletCard': {
      description: 'Virtual and physical cards',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'user_email', type: 'VARCHAR(255)', fk: 'User.email', desc: 'Card owner' },
        { name: 'card_type', type: 'ENUM', values: ['virtual', 'physical_visa', 'physical_mastercard'], desc: 'Card type' },
        { name: 'card_number', type: 'VARCHAR(4)', desc: 'Last 4 digits (masked)' },
        { name: 'card_holder_name', type: 'VARCHAR(255)', desc: 'Cardholder name' },
        { name: 'expiry_date', type: 'VARCHAR(5)', desc: 'MM/YY format' },
        { name: 'cvv_token', type: 'VARCHAR(255)', desc: 'Tokenized CVV' },
        { name: 'daily_limit', type: 'DECIMAL(18,2)', default: '50000', desc: 'Daily spending limit' },
        { name: 'status', type: 'ENUM', values: ['active', 'blocked', 'expired'], desc: 'Card status' },
        { name: 'is_primary', type: 'BOOLEAN', desc: 'Primary card' },
        { name: 'paypal_sub_wallet_id', type: 'VARCHAR(255)', desc: 'PayMongo sub-wallet ID' },
        { name: 'created_date', type: 'TIMESTAMP', desc: 'Issuance date' },
      ]
    },
    'WalletTransaction': {
      description: 'All wallet transactions',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'user_email', type: 'VARCHAR(255)', fk: 'User.email', desc: 'User' },
        { name: 'type', type: 'ENUM', values: ['deposit', 'withdrawal', 'payment', 'transfer', 'refund'], desc: 'Transaction type' },
        { name: 'amount', type: 'DECIMAL(18,2)', desc: 'Transaction amount (PHP)' },
        { name: 'currency', type: 'VARCHAR(3)', desc: 'Currency code' },
        { name: 'exchange_rate', type: 'DECIMAL(18,6)', desc: 'FX rate applied (if multi-currency)' },
        { name: 'fee', type: 'DECIMAL(18,2)', default: '0', desc: 'Transaction fee' },
        { name: 'status', type: 'ENUM', values: ['pending', 'completed', 'failed'], desc: 'Status' },
        { name: 'reference_id', type: 'VARCHAR(255)', unique: true, desc: 'Provider reference' },
        { name: 'source_method', type: 'VARCHAR(50)', desc: 'card, bank, gcash' },
        { name: 'destination', type: 'VARCHAR(255)', desc: 'Recipient/merchant' },
        { name: 'description', type: 'TEXT', desc: 'Transaction description' },
        { name: 'created_date', type: 'TIMESTAMP', desc: 'Transaction date' },
      ]
    },
    'BankTransfer': {
      description: 'Bank transfer records',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'user_email', type: 'VARCHAR(255)', fk: 'User.email', desc: 'Sender' },
        { name: 'transfer_type', type: 'ENUM', values: ['wallet_to_bank', 'bank_to_wallet', 'wallet_to_wallet'], desc: 'Transfer type' },
        { name: 'amount', type: 'DECIMAL(18,2)', desc: 'Transfer amount' },
        { name: 'recipient_name', type: 'VARCHAR(255)', desc: 'Recipient name' },
        { name: 'recipient_account', type: 'VARCHAR(255)', desc: 'Bank account number' },
        { name: 'recipient_bank', type: 'VARCHAR(255)', desc: 'Bank name' },
        { name: 'status', type: 'ENUM', values: ['pending', 'processing', 'completed', 'failed'], desc: 'Status' },
        { name: 'fee', type: 'DECIMAL(18,2)', desc: 'Transfer fee' },
        { name: 'processed_date', type: 'TIMESTAMP', desc: 'When processed' },
        { name: 'error_message', type: 'TEXT', desc: 'Error details if failed' },
      ]
    },
    'WalletKYC': {
      description: 'KYC/AML verification',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'user_email', type: 'VARCHAR(255)', fk: 'User.email', unique: true, desc: 'User' },
        { name: 'kyc_status', type: 'ENUM', values: ['pending', 'verified', 'rejected', 'expired'], desc: 'Verification status' },
        { name: 'identity_type', type: 'ENUM', values: ['passport', 'drivers_license', 'national_id', 'tin'], desc: 'Document type' },
        { name: 'identity_number', type: 'VARCHAR(255)', desc: 'Document number' },
        { name: 'full_name', type: 'VARCHAR(255)', desc: 'Legal name' },
        { name: 'date_of_birth', type: 'DATE', desc: 'DOB' },
        { name: 'nationality', type: 'VARCHAR(100)', desc: 'Nationality' },
        { name: 'address', type: 'TEXT', desc: 'Residential address' },
        { name: 'document_front_url', type: 'VARCHAR(500)', desc: 'ID front image URL' },
        { name: 'document_back_url', type: 'VARCHAR(500)', desc: 'ID back image URL' },
        { name: 'selfie_url', type: 'VARCHAR(500)', desc: 'Selfie image URL' },
        { name: 'risk_score', type: 'DECIMAL(3,1)', desc: '0-100 risk assessment' },
        { name: 'aml_check_status', type: 'ENUM', values: ['clear', 'flagged', 'under_review'], desc: 'AML status' },
        { name: 'verification_date', type: 'TIMESTAMP', desc: 'Verification date' },
        { name: 'expiry_date', type: 'DATE', desc: 'KYC expiry (5 years)' },
      ]
    },
    'CurrencyAccount': {
      description: 'Multi-currency wallets',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'user_email', type: 'VARCHAR(255)', fk: 'User.email', desc: 'User' },
        { name: 'currency', type: 'VARCHAR(3)', desc: 'USD, EUR, SGD, AED, GBP, JPY, CNY, AUD' },
        { name: 'balance', type: 'DECIMAL(18,2)', default: '0', desc: 'Balance in specified currency' },
        { name: 'is_primary', type: 'BOOLEAN', default: 'false', desc: 'Primary account' },
        { name: 'status', type: 'ENUM', values: ['active', 'inactive'], desc: 'Status' },
        { name: 'last_exchange_rate', type: 'DECIMAL(18,6)', desc: 'Last used FX rate' },
        { name: 'created_date', type: 'TIMESTAMP', desc: 'Created date' },
      ],
      unique: 'UNIQUE(user_email, currency)'
    },
    'CurrencyRate': {
      description: 'FX rates history',
      columns: [
        { name: 'id', type: 'UUID', pk: true, desc: 'Primary key' },
        { name: 'from_currency', type: 'VARCHAR(3)', desc: 'Source currency' },
        { name: 'to_currency', type: 'VARCHAR(3)', desc: 'Target currency (PHP)' },
        { name: 'rate', type: 'DECIMAL(18,6)', desc: 'Exchange rate' },
        { name: 'markup_percentage', type: 'DECIMAL(5,2)', default: '2', desc: 'GC markup (%)' },
        { name: 'effective_rate', type: 'DECIMAL(18,6)', desc: 'Rate with markup' },
        { name: 'source', type: 'VARCHAR(50)', desc: 'ExchangeRate API' },
        { name: 'created_date', type: 'TIMESTAMP', desc: 'Rate timestamp' },
      ]
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3 flex items-center gap-3">
            <Database className="w-10 h-10 text-blue-600" />
            Database Schema
          </h1>
          <p className="text-lg text-slate-600">Complete PostgreSQL schema for fintech operations</p>
        </motion.div>

        {/* Schema Diagram */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Entity Relationships</h2>
          <div className="bg-slate-100 p-6 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{`
User (Base44 built-in)
├── Wallet (1:1)
├── WalletCard (1:N)
├── WalletTransaction (1:N)
├── BankTransfer (1:N)
├── WalletKYC (1:1)
├── CurrencyAccount (1:N)
└── FlightBooking, HotelBooking, etc.

WalletTransaction
├── references Wallet (debit/credit)
├── references WalletCard (if card-based)
└── references Booking (if payment)

BankTransfer
└── references Wallet (settlement)

WalletKYC
└── references User (1:1, unique)

CurrencyAccount
├── references User (1:N)
└── references CurrencyRate (historical)
            `}</pre>
          </div>
        </Card>

        {/* Table Details */}
        <Tabs defaultValue="Wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="Wallet">Wallet</TabsTrigger>
            <TabsTrigger value="WalletCard">Cards</TabsTrigger>
            <TabsTrigger value="WalletTransaction">Transactions</TabsTrigger>
            <TabsTrigger value="KYC & Multi-Currency">KYC & FX</TabsTrigger>
          </TabsList>

          {Object.entries(tables).map(([tableName, data]) => (
            <TabsContent key={tableName} value={tableName} className="space-y-6">
              <Card className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{tableName}</h2>
                  <p className="text-slate-600">{data.description}</p>
                  {data.unique && <p className="text-xs text-slate-500 mt-2">Unique constraint: {data.unique}</p>}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b-2 border-slate-300 bg-slate-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-slate-900">Column</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-900">Type</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-900">Constraints</th>
                        <th className="text-left py-3 px-4 font-bold text-slate-900">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {data.columns.map((col, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-900 font-semibold">
                            {col.name}
                            {col.pk && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">PK</span>}
                            {col.fk && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">FK</span>}
                            {col.unique && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">UNIQUE</span>}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">{col.type}</td>
                          <td className="py-3 px-4 text-xs text-slate-600">
                            {col.default && <div>Default: {col.default}</div>}
                            {col.values && <div>Values: {col.values.join(', ')}</div>}
                            {col.fk && <div>References: {col.fk}</div>}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{col.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Indexes & Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12 space-y-6">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Database Indexes (Performance)</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-mono text-sm text-blue-900">
                  <strong>Wallet:</strong> CREATE INDEX idx_wallet_user_email ON Wallet(user_email);
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-mono text-sm text-blue-900">
                  <strong>WalletTransaction:</strong> CREATE INDEX idx_tx_user_created ON WalletTransaction(user_email, created_date DESC);
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-mono text-sm text-blue-900">
                  <strong>WalletCard:</strong> CREATE INDEX idx_card_user ON WalletCard(user_email, status);
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-mono text-sm text-blue-900">
                  <strong>WalletKYC:</strong> CREATE INDEX idx_kyc_status ON WalletKYC(kyc_status, aml_check_status);
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="font-mono text-sm text-blue-900">
                  <strong>CurrencyRate:</strong> CREATE INDEX idx_rate_timestamp ON CurrencyRate(from_currency, to_currency, created_date DESC);
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Backup & Security Strategy</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-slate-900 mb-3">Backup</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>✓ Full backup daily (0 UTC)</li>
                  <li>✓ Incremental hourly</li>
                  <li>✓ 7-year retention</li>
                  <li>✓ Geographic redundancy</li>
                  <li>✓ Point-in-time recovery</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-3">Encryption</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>✓ At-rest: AES-256</li>
                  <li>✓ In-transit: TLS 1.3</li>
                  <li>✓ Card data: Tokenized</li>
                  <li>✓ PII: Encrypted columns</li>
                  <li>✓ Database user auth</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}