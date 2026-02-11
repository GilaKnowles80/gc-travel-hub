import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const cabinClasses = [
  { value: "all", label: "All Classes" },
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first_class", label: "First Class" },
];

export default function FlightFilters({ filters, onFilterChange, onClear }) {
  const hasActiveFilters = filters.search || filters.cabin_class !== "all" || filters.is_direct !== "all";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search origin or destination..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        <Select value={filters.cabin_class} onValueChange={(value) => onFilterChange("cabin_class", value)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Cabin Class" />
          </SelectTrigger>
          <SelectContent>
            {cabinClasses.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.is_direct} onValueChange={(value) => onFilterChange("is_direct", value)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Flight Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flights</SelectItem>
            <SelectItem value="true">Direct Only</SelectItem>
            <SelectItem value="false">With Stops</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-500 rounded-xl">
            <X className="w-4 h-4 mr-2" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}