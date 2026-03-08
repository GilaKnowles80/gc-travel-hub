import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CUSTOMIZATION_OPTIONS = {
  keychain: {
    colors: ["Silver", "Gold", "Black"],
    hasEngraving: true,
    engravingCharge: 50,
  },
  magnet: {
    colors: ["Red", "Blue", "Gold"],
    hasEngraving: false,
    engravingCharge: 0,
  },
  tshirt: {
    colors: ["White", "Black", "Navy Blue", "Maroon"],
    hasEngraving: true,
    engravingCharge: 100,
  },
  mug: {
    colors: ["White", "Black", "Navy"],
    hasEngraving: true,
    engravingCharge: 75,
  },
};

export default function SouvenirCustomizer({ product, isOpen, onClose, onAddToCart }) {
  const [selectedColor, setSelectedColor] = useState("");
  const [engravingText, setEngravingText] = useState("");
  const [engravingEnabled, setEngravingEnabled] = useState(false);

  const productType = product.title.toLowerCase().includes("keychain")
    ? "keychain"
    : product.title.toLowerCase().includes("magnet")
    ? "magnet"
    : product.title.toLowerCase().includes("t-shirt")
    ? "tshirt"
    : "mug";

  const options = CUSTOMIZATION_OPTIONS[productType];

  if (!options) return null;

  const engravingCharge = engravingEnabled && options.hasEngraving ? options.engravingCharge : 0;
  const finalPrice = product.price + engravingCharge;

  const handleAddToCart = () => {
    const customization = {
      color: selectedColor,
      engraving: engravingEnabled ? engravingText : null,
      engravingCharge,
    };

    onAddToCart({
      ...product,
      price: finalPrice,
      customization,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Customize {product.title}</DialogTitle>
          <DialogDescription>Personalize your souvenir with your preferences</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Color Selection */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Choose Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {options.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    selectedColor === color
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Engraving Option */}
          {options.hasEngraving && (
            <div>
              <button
                onClick={() => setEngravingEnabled(!engravingEnabled)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  engravingEnabled
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={engravingEnabled}
                    readOnly
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">Add Engraving</div>
                    <div className="text-xs text-slate-500">+₱{options.engravingCharge}</div>
                  </div>
                </div>
              </button>

              {engravingEnabled && (
                <Input
                  placeholder="Enter name or text (max 20 characters)"
                  value={engravingText}
                  onChange={(e) => setEngravingText(e.target.value.slice(0, 20))}
                  maxLength="20"
                  className="mt-2"
                />
              )}
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-600">Base Price</span>
              <span className="font-medium">₱{product.price.toLocaleString()}</span>
            </div>
            {engravingCharge > 0 && (
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="text-slate-600">Engraving</span>
                <span className="font-medium">+₱{engravingCharge}</span>
              </div>
            )}
            <div className="border-t border-amber-200 pt-2 flex justify-between items-center font-bold">
              <span>Total</span>
              <span className="text-amber-600">₱{finalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedColor || (options.hasEngraving && engravingEnabled && !engravingText)}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}