import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Hash, Plane, Hotel, Bus, Ship, Anchor, MapPin, FileText, Car, Shield } from "lucide-react";
import {
  generateFlightPRN,
  generateLocationPRN,
  getPRNType,
  getLocationKey,
  PRN_PREFIXES,
} from "@/components/utils/prnGenerator";

const FLIGHT_TYPES = [
  { key: "flight_international_roundtrip", label: "International Roundtrip", example: "ITRAAA1" },
  { key: "flight_international_oneway",    label: "International One-Way",   example: "IOWAAA1" },
  { key: "flight_domestic_roundtrip",      label: "Domestic Roundtrip",      example: "DTRAAA1" },
  { key: "flight_domestic_oneway",         label: "Domestic One-Way",        example: "DOWAAA1" },
];

const LOCATION_TYPES = [
  { key: "hotel_international",  label: "Hotel International",      icon: Hotel,   example: "HIT1" },
  { key: "hotel_local",          label: "Hotel Local (PH)",         icon: Hotel,   example: "HLM1" },
  { key: "bus_international",    label: "Bus International",        icon: Bus,     example: "BSIT1" },
  { key: "bus_local",            label: "Bus Local",                icon: Bus,     example: "BSLM1" },
  { key: "ferry_international",  label: "Ferry International",      icon: Ship,    example: "FRIT1" },
  { key: "ferry_local",          label: "Ferry Local",              icon: Ship,    example: "FRLM1" },
  { key: "cruise_international", label: "Cruise International",     icon: Anchor,  example: "CRIT1" },
  { key: "cruise_local",         label: "Cruise Local",             icon: Anchor,  example: "CRLM1" },
  { key: "tour_international",   label: "Tour International",       icon: MapPin,  example: "TRIT1" },
  { key: "tour_local",           label: "Tour Local",               icon: MapPin,  example: "TRLM1" },
  { key: "visa",                 label: "Visa Processing",          icon: FileText,example: "VIST1" },
  { key: "car_international",    label: "Car Rental International", icon: Car,     example: "CAIT1" },
  { key: "car_local",            label: "Car Rental Local",         icon: Car,     example: "CALM1" },
  { key: "insurance",            label: "Travel Insurance",         icon: Shield,  example: "TINT1" },
];

function FlightPreviewTable() {
  const rows = [];
  const types = FLIGHT_TYPES;
  for (let i = 1; i <= 12; i++) {
    const rowTypes = types.map(t => generateFlightPRN(t.key, i));
    rows.push({ seq: i, values: rowTypes });
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-100">
            <th className="px-3 py-2 font-semibold text-slate-600">Seq#</th>
            {types.map(t => (
              <th key={t.key} className="px-3 py-2 font-semibold text-slate-600">{t.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.seq} className="border-t hover:bg-slate-50">
              <td className="px-3 py-2 text-slate-400 font-mono">{row.seq}</td>
              {row.values.map((val, i) => (
                <td key={i} className="px-3 py-2 font-mono font-bold text-blue-700">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PRNPreviewGenerator() {
  const [category, setCategory] = useState("flight");
  const [tripType, setTripType] = useState("roundtrip");
  const [isIntl, setIsIntl] = useState("true");
  const [location, setLocation] = useState("Thailand");
  const [seq, setSeq] = useState("1");
  const [result, setResult] = useState("");

  const generate = () => {
    try {
      const type = getPRNType(
        category,
        tripType,
        isIntl === "true"
      );
      const seqNum = parseInt(seq) || 1;
      let prn;
      if (category === "flight") {
        prn = generateFlightPRN(type, seqNum);
      } else {
        const letter = getLocationKey(location);
        prn = generateLocationPRN(type, letter, seqNum);
      }
      setResult(prn);
    } catch (e) {
      setResult("Error: " + e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label>Booking Type</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="bus">Bus</SelectItem>
              <SelectItem value="ferry">Ferry</SelectItem>
              <SelectItem value="cruise">Cruise</SelectItem>
              <SelectItem value="tour">Tour</SelectItem>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="car">Car Rental</SelectItem>
              <SelectItem value="insurance">Travel Insurance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Trip Type</Label>
          <Select value={tripType} onValueChange={setTripType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="roundtrip">Roundtrip</SelectItem>
              <SelectItem value="one_way">One-Way</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>International?</Label>
          <Select value={isIntl} onValueChange={setIsIntl}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">International</SelectItem>
              <SelectItem value="false">Domestic / Local</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {category !== "flight" && (
          <div>
            <Label>Country / City / Destination</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Thailand, Manila" />
          </div>
        )}
        <div>
          <Label>Sequence Number</Label>
          <Input type="number" min="1" value={seq} onChange={e => setSeq(e.target.value)} />
        </div>
      </div>
      <Button onClick={generate} className="gap-2">
        <Hash className="w-4 h-4" /> Generate PRN
      </Button>
      {result && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-500 mb-1">Generated PRN</p>
          <p className="text-4xl font-black font-mono text-blue-700 tracking-widest">{result}</p>
        </div>
      )}
    </div>
  );
}

export default function AdminPRNReference() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
            <Hash className="w-8 h-8 text-blue-600" />
            Personal Reference Number (PRN) System
          </h1>
          <p className="text-slate-500 mt-2">GC Travel & Tours — Chronological booking reference format</p>
        </div>

        {/* Format Guide */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Flights */}
          <Card className="border-2 border-blue-100">
            <CardHeader className="bg-blue-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Plane className="w-5 h-5" /> Flight PRN Format
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Pattern:</span> <code className="bg-slate-100 px-1 rounded">[PREFIX] + [3 letters] + [1 digit]</code>
              </p>
              <p className="text-xs text-slate-500">Letters cycle A→Z sequentially (AAA→AAB→...→ZZZ), digit cycles 1–9</p>
              <div className="space-y-2">
                {FLIGHT_TYPES.map(t => (
                  <div key={t.key} className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{t.label}</span>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="font-mono text-blue-700">{PRN_PREFIXES[t.key]}___#</Badge>
                      <Badge className="bg-blue-600 font-mono">{t.example}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location-based */}
          <Card className="border-2 border-green-100">
            <CardHeader className="bg-green-50 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MapPin className="w-5 h-5" /> Location-Based PRN Format
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">Pattern:</span> <code className="bg-slate-100 px-1 rounded">[PREFIX] + [1st letter of place] + [seq #]</code>
              </p>
              <p className="text-xs text-slate-500">Sequence increments per prefix+letter combination</p>
              <div className="space-y-1.5 mt-2">
                {LOCATION_TYPES.map(t => (
                  <div key={t.key} className="flex justify-between items-center">
                    <span className="text-sm text-slate-700">{t.label}</span>
                    <div className="flex gap-2 items-center">
                      <Badge variant="outline" className="font-mono text-green-700">{PRN_PREFIXES[t.key]}[X]#</Badge>
                      <Badge className="bg-green-600 font-mono">{t.example}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-600" /> Live PRN Preview Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PRNPreviewGenerator />
          </CardContent>
        </Card>

        {/* Flight Sequence Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-blue-600" /> Flight PRN Sequence Preview (first 12)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FlightPreviewTable />
          </CardContent>
        </Card>

        {/* Integration note */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800 font-semibold mb-1">How to use in booking pages:</p>
            <pre className="text-xs bg-white rounded p-3 overflow-x-auto text-slate-700">{`import { generatePRN } from "@/components/utils/prnGenerator";

// Inside your booking submit handler:
const prn = await generatePRN(
  base44,
  "flight",          // bookingCategory
  "roundtrip",       // tripType
  true,              // isInternational
  "Bangkok"          // locationName (for hotel/bus/etc)
);
// Save prn into supplier_reference field of the booking`}</pre>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}