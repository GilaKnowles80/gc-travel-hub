import React, { useState } from "react";
import { X, ShoppingCart, Trash2, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartContext";
import { base44 } from "@/api/base44Client";

export default function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, clearCart, totalUSD, totalPHP } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    // Check if in iframe
    if (window.self !== window.top) {
      alert("Checkout only works from the published app. Please open the app directly.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('createDigitalProductCheckout', {
        product_ids: items.map(i => i.id),
        success_url: `${window.location.origin}/DigitalStore?success=true`,
        cancel_url: `${window.location.origin}/DigitalStore?cancelled=true`,
      });
      if (res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        setError(res.data?.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-800">Your Cart ({items.length})</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item.cartId || item.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-amber-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-amber-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                  {item.customization && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.customization.color && <div>Color: {item.customization.color}</div>}
                      {item.customization.engraving && <div>Engraved: "{item.customization.engraving}"</div>}
                    </div>
                  )}
                  <p className="text-sm text-amber-600 font-bold mt-1">₱{item.price?.toLocaleString()}</p>
                </div>
                <button onClick={() => removeFromCart(item.cartId || item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-100 space-y-3">
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₱{totalPHP?.toLocaleString()} <span className="text-slate-400">(${totalUSD?.toFixed(2)})</span></span>
            </div>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 font-semibold"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><CreditCard className="w-4 h-4 mr-2" /> Checkout via Stripe</>}
            </Button>
            <button onClick={clearCart} className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}