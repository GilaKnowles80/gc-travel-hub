import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Users, Plus, Minus } from "lucide-react";

export default function TravelersSelector({ value, onChange }) {
  const [travelers, setTravelers] = useState({
    adults: value?.adults || 1,
    children: value?.children || 0,
    infants: value?.infants || 0,
    seniors: value?.seniors || 0,
    pwd: value?.pwd || 0,
  });

  const handleChange = (type, delta) => {
    const newValue = Math.max(0, travelers[type] + delta);
    const updated = { ...travelers, [type]: newValue };
    setTravelers(updated);
    onChange?.(updated);
  };

  const total = travelers.adults + travelers.children + travelers.infants + travelers.seniors + travelers.pwd;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full text-left">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-500">Travelers</span>
          </div>
          <div className="text-sm font-medium text-slate-800">
            {total} {total === 1 ? 'Traveler' : 'Travelers'}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Adults</p>
              <p className="text-xs text-slate-500">18-59 years</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('adults', -1)}
                disabled={travelers.adults === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{travelers.adults}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('adults', 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Children</p>
              <p className="text-xs text-slate-500">2-17 years</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('children', -1)}
                disabled={travelers.children === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{travelers.children}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('children', 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Infants</p>
              <p className="text-xs text-slate-500">Under 2 years • 50% off</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('infants', -1)}
                disabled={travelers.infants === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{travelers.infants}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('infants', 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Senior Citizens</p>
              <p className="text-xs text-slate-500">60+ years • 10% off</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('seniors', -1)}
                disabled={travelers.seniors === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{travelers.seniors}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('seniors', 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">PWD</p>
              <p className="text-xs text-slate-500">Persons with Disability • 10% off</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('pwd', -1)}
                disabled={travelers.pwd === 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{travelers.pwd}</span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-full"
                onClick={() => handleChange('pwd', 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}