import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, Hotel, MapPin, ShoppingCart, Tag, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PackageSummary({ 
  packageName, 
  flights, 
  hotels, 
  tours, 
  totalPrice, 
  discount, 
  finalPrice,
  onSave,
  isSaving
}) {
  const itemCount = flights.length + hotels.length + tours.length;

  return (
    <Card className="border-2 border-amber-200 shadow-xl">
      <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 border-b-2 border-amber-200">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-amber-600" />
          Package Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <p className="text-sm text-slate-600 mb-1">Package Name</p>
          <p className="font-bold text-lg">{packageName}</p>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-3 py-4 border-y">
          {flights.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Flights</span>
              </div>
              <Badge variant="outline">{flights.length}</Badge>
            </div>
          )}
          {hotels.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4 text-purple-600" />
                <span className="text-sm">Hotels</span>
              </div>
              <Badge variant="outline">{hotels.length}</Badge>
            </div>
          )}
          {tours.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm">Tours</span>
              </div>
              <Badge variant="outline">{tours.length}</Badge>
            </div>
          )}
          
          {itemCount === 0 && (
            <p className="text-sm text-slate-500 text-center py-4">
              No items added yet
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">${totalPrice.toLocaleString()}</span>
          </div>
          
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-between text-sm bg-green-50 -mx-2 px-2 py-2 rounded"
            >
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-medium">Package Discount ({discount}%)</span>
              </div>
              <span className="text-green-700 font-bold">
                -${((totalPrice * discount) / 100).toLocaleString()}
              </span>
            </motion.div>
          )}
          
          <div className="flex justify-between text-lg font-bold pt-2 border-t-2">
            <span>Total</span>
            <span className="text-amber-600">${finalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Discount Info */}
        {itemCount > 0 && itemCount < 3 && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-700">
                {itemCount === 1 && "Add 1 more item to get 10% off!"}
                {itemCount === 2 && "Add 1 more item to get 15% off!"}
              </div>
            </div>
          </div>
        )}

        {discount === 15 && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-700 font-medium">
                Maximum discount applied! 🎉
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={onSave}
          disabled={itemCount === 0 || isSaving}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-6"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Save Package
            </>
          )}
        </Button>

        {itemCount > 0 && (
          <p className="text-xs text-slate-500 text-center">
            Your package will be saved and you can book it later
          </p>
        )}
      </CardContent>
    </Card>
  );
}