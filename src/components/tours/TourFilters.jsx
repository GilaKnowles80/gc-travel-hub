import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "beach", label: "Beach" },
  { value: "adventure", label: "Adventure" },
  { value: "cultural", label: "Cultural" },
  { value: "cruise", label: "Cruise" },
  { value: "wildlife", label: "Wildlife" },
  { value: "city_tour", label: "City Tour" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "pilgrimage", label: "Pilgrimage" },
];

const priceRanges = [
  { value: "all", label: "Any Price" },
  { value: "0-500", label: "Under $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-2000", label: "$1,000 - $2,000" },
  { value: "2000-99999", label: "$2,000+" },
];

const durations = [
  { value: "all", label: "Any Duration" },
  { value: "1-3", label: "1-3 Days" },
  { value: "4-7", label: "4-7 Days" },
  { value: "8-14", label: "8-14 Days" },
  { value: "15-99", label: "15+ Days" },
];

export default function TourFilters({ filters, onFilterChange, onClear }) {
  const hasActiveFilters =
    filters.search ||
    filters.category !== "all" ||
    filters.price !== "all" ||
    filters.duration !== "all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-700">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="font-semibold text-sm">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-slate-500">
            <X className="w-3 h-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tours..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-10 rounded-xl border-slate-200"
          />
        </div>

        <Select value={filters.category} onValueChange={(val) => onFilterChange("category", val)}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.price} onValueChange={(val) => onFilterChange("price", val)}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {priceRanges.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.duration} onValueChange={(val) => onFilterChange("duration", val)}>
          <SelectTrigger className="rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {durations.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}