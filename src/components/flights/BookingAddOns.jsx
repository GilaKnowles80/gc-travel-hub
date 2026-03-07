import React from "react";
import { Shield, Luggage, PawPrint, Check } from "lucide-react";

const INSURANCE_OPTIONS = [
  {
    id: "basic",
    name: "Basic Travel Protection",
    price_php: 350,
    price_usd: 6,
    description: "Trip cancellation, medical emergency up to ₱50,000",
    features: ["Trip cancellation", "Medical emergency", "Lost baggage"],
    badge: "Popular",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "standard",
    name: "Standard Coverage",
    price_php: 750,
    price_usd: 13,
    description: "Comprehensive coverage up to ₱200,000",
    features: ["All Basic benefits", "Flight delay allowance", "24/7 assistance", "Personal liability"],
    badge: "Recommended",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "premium",
    name: "Premium Protection",
    price_php: 1500,
    price_usd: 27,
    description: "Full protection up to ₱500,000 + adventure sports",
    features: ["All Standard benefits", "Adventure sports", "Electronics coverage", "Cancel for any reason"],
    badge: "Best Value",
    badgeColor: "bg-purple-100 text-purple-700",
  },
];

const LUGGAGE_OPTIONS = [
  { id: "luggage_20kg", name: "Extra Baggage 20kg", price_php: 850, price_usd: 15, description: "1 additional checked bag, 20kg" },
  { id: "luggage_32kg", name: "Extra Baggage 32kg", price_php: 1200, price_usd: 21, description: "1 additional checked bag, 32kg (heavy)" },
  { id: "sport_equipment", name: "Sports Equipment", price_php: 1500, price_usd: 27, description: "Bike, surfboard, golf bag, etc." },
];

const PET_OPTIONS = [
  { id: "pet_cabin", name: "Pet in Cabin", price_php: 1800, price_usd: 32, description: "Small pet (max 8kg incl. carrier) in cabin" },
  { id: "pet_cargo", name: "Pet in Cargo", price_php: 2500, price_usd: 45, description: "Larger pets in pressurized cargo hold" },
];

export default function BookingAddOns({ addOns, onChange, passengers = 1 }) {
  const toggle = (category, item) => {
    const current = addOns[category];
    if (current?.id === item.id) {
      onChange({ ...addOns, [category]: null });
    } else {
      onChange({ ...addOns, [category]: item });
    }
  };

  const toggleMultiple = (category, item) => {
    const current = addOns[category] || [];
    const exists = current.find(i => i.id === item.id);
    if (exists) {
      onChange({ ...addOns, [category]: current.filter(i => i.id !== item.id) });
    } else {
      onChange({ ...addOns, [category]: [...current, item] });
    }
  };

  const isSelected = (category, id) => {
    const current = addOns[category];
    if (Array.isArray(current)) return current.some(i => i.id === id);
    return current?.id === id;
  };

  const totalAddOnsPHP = [
    addOns.insurance ? addOns.insurance.price_php * passengers : 0,
    ...(addOns.luggage || []).map(l => l.price_php * passengers),
    ...(addOns.pets || []).map(p => p.price_php),
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Travel Insurance */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Travel Insurance</h3>
            <p className="text-xs text-slate-500">Protect your trip — optional</p>
          </div>
        </div>
        <div className="space-y-2">
          {INSURANCE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle("insurance", opt)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                isSelected("insurance", opt.id)
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected("insurance", opt.id) ? "border-blue-500 bg-blue-500" : "border-slate-300"
                  }`}>
                    {isSelected("insurance", opt.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-800">{opt.name}</span>
                      {opt.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${opt.badgeColor}`}>{opt.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {opt.features.map(f => (
                        <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-blue-600 text-sm">+₱{opt.price_php.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">per person</p>
                </div>
              </div>
            </button>
          ))}
          <button
            type="button"
            onClick={() => toggle("insurance", { id: "none" })}
            className={`w-full text-left p-2.5 rounded-xl border-2 transition-all text-sm ${
              !addOns.insurance ? "border-slate-300 bg-slate-50 text-slate-600" : "border-slate-200 text-slate-400 hover:border-slate-300"
            }`}
          >
            No insurance — I'll take my chances
          </button>
        </div>
      </div>

      {/* Extra Luggage */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Luggage className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Extra Baggage</h3>
            <p className="text-xs text-slate-500">Add checked bags or special items — optional</p>
          </div>
        </div>
        <div className="space-y-2">
          {LUGGAGE_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleMultiple("luggage", opt)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                isSelected("luggage", opt.id)
                  ? "border-amber-500 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    isSelected("luggage", opt.id) ? "border-amber-500 bg-amber-500" : "border-slate-300"
                  }`}>
                    {isSelected("luggage", opt.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{opt.name}</p>
                    <p className="text-xs text-slate-500">{opt.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-amber-600 text-sm">+₱{opt.price_php.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">per person</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pet Passenger */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
            <PawPrint className="w-4 h-4 text-pink-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Pet Passenger</h3>
            <p className="text-xs text-slate-500">Traveling with a furry friend? — optional</p>
          </div>
        </div>
        <div className="space-y-2">
          {PET_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggleMultiple("pets", opt)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                isSelected("pets", opt.id)
                  ? "border-pink-500 bg-pink-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    isSelected("pets", opt.id) ? "border-pink-500 bg-pink-500" : "border-slate-300"
                  }`}>
                    {isSelected("pets", opt.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800">{opt.name}</p>
                    <p className="text-xs text-slate-500">{opt.description}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-pink-600 text-sm">+₱{opt.price_php.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">flat fee</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Add-ons summary */}
      {totalAddOnsPHP > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-amber-800">Add-ons Total</span>
          <span className="text-lg font-bold text-amber-700">+₱{totalAddOnsPHP.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}