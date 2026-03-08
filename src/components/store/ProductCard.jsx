import React, { useState } from "react";
import { ShoppingCart, Check, FileText, BookOpen, Table, List, Download, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartContext";
import SouvenirCustomizer from "./SouvenirCustomizer";

const categoryConfig = {
  travel_guide: { label: "Travel Guide", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  visa_template: { label: "Visa Template", icon: FileText, color: "bg-purple-100 text-purple-700" },
  budget_spreadsheet: { label: "Budget Sheet", icon: Table, color: "bg-green-100 text-green-700" },
  checklist: { label: "Checklist", icon: List, color: "bg-orange-100 text-orange-700" },
  ebook: { label: "eBook", icon: BookOpen, color: "bg-pink-100 text-pink-700" },
  souvenir: { label: "Souvenir", icon: Sparkles, color: "bg-amber-100 text-amber-700" },
  other: { label: "Other", icon: Download, color: "bg-slate-100 text-slate-700" },
};

export default function ProductCard({ product }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const inCart = isInCart(product.id);
  const config = categoryConfig[product.category] || categoryConfig.other;
  const IconComp = config.icon;
  const phpPrice = product.price;
  const usdPrice = product.price_usd || (product.price / 56).toFixed(2);
  const isSouvenir = product.category === "souvenir";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconComp className="w-16 h-16 text-amber-300" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{product.title}</h3>
        <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">{product.description}</p>

        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div>
            <p className="font-bold text-amber-600 text-lg">₱{phpPrice?.toLocaleString()}</p>
            <p className="text-xs text-slate-400">${usdPrice} USD</p>
          </div>
          {isSouvenir ? (
            <>
              <Button
                size="sm"
                onClick={() => setCustomizeOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Sparkles className="w-3 h-3 mr-1" /> Customize
              </Button>
              <SouvenirCustomizer
                product={product}
                isOpen={customizeOpen}
                onClose={() => setCustomizeOpen(false)}
                onAddToCart={(customProduct) => addToCart(customProduct)}
              />
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => inCart ? removeFromCart(product.id) : addToCart(product)}
              className={inCart
                ? "bg-green-500 hover:bg-red-500 text-white transition-colors"
                : "bg-amber-500 hover:bg-amber-600 text-white"}
            >
              {inCart ? <><Check className="w-3 h-3 mr-1" /> Added</> : <><ShoppingCart className="w-3 h-3 mr-1" /> Add</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}