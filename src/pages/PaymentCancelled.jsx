import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircle className="w-14 h-14 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-slate-900 mb-3">Payment Cancelled</h1>
            <p className="text-lg text-slate-600 mb-8">
              Your payment was cancelled. No charges were made to your account.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-amber-900">
                💡 <strong>Need help?</strong> Contact our support team if you encountered any issues during checkout.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate(-1)}
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('Home'))}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}