import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Search, BookOpen, CheckCircle2, Download, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartProvider, useCart } from "@/components/store/CartContext";
import ProductCard from "@/components/store/ProductCard";
import CartDrawer from "@/components/store/CartDrawer";

const CATEGORIES = [
  { value: "all", label: "All Products" },
  { value: "travel_guide", label: "Travel Guides" },
  { value: "visa_template", label: "Visa Templates" },
  { value: "budget_spreadsheet", label: "Budget Sheets" },
  { value: "checklist", label: "Checklists" },
  { value: "ebook", label: "eBooks" },
  { value: "souvenir", label: "GC Souvenirs" },
];

function StoreContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const { items } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['digital-products'],
    queryFn: () => base44.entities.DigitalProduct.filter({ status: 'available' }),
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setSuccessMessage("Payment successful! Check your email for download links.");
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('cancelled') === 'true') {
      setSuccessMessage(null);
    }
  }, []);

  const filtered = products.filter(p => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
            <Download className="w-4 h-4" />
            Digital Products & Premium Souvenirs
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">GC Travel Digital Store</h1>
          <p className="text-lg text-amber-100 max-w-xl mx-auto">
            Expert travel guides, visa checklists, budget tools, and premium GC branded souvenirs. Door-to-door delivery in 2-3 weeks.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm flex-wrap justify-center">
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Instant digital delivery</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Premium souvenirs</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Secure checkout</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Success Banner */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 text-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat.value
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-amber-50 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              onClick={() => setCartOpen(true)}
              className="relative bg-amber-500 hover:bg-amber-600 text-white"
            >
              <ShoppingCart className="w-4 h-4" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
              <span className="ml-1 hidden md:inline">Cart</span>
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md h-72 animate-pulse">
                <div className="h-44 bg-slate-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Trust Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-amber-100 text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Why Buy From Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "✈️", title: "Expert Knowledge", desc: "Created by travel professionals with years of experience" },
              { icon: "⚡", title: "Instant Access", desc: "Download immediately after payment — no waiting" },
              { icon: "🛡️", title: "Secure Payment", desc: "Protected by Stripe — the world's most trusted payment platform" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export default function DigitalStore() {
  return (
    <CartProvider>
      <StoreContent />
    </CartProvider>
  );
}