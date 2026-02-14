import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Clock, DollarSign, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Visas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [expandedVisa, setExpandedVisa] = useState(null);

  const { data: visas = [], isLoading } = useQuery({
    queryKey: ["visas"],
    queryFn: () => base44.entities.Visa.filter({ status: "active" }, "-created_date"),
  });

  const filteredVisas = useMemo(() => {
    return visas.filter((visa) => {
      const matchesSearch =
        visa.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = visaTypeFilter === "all" || visa.visa_type === visaTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [visas, searchTerm, visaTypeFilter]);

  const visaTypes = ["tourist", "business", "student", "work", "transit"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Visa Services
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore visa options for destinations around the world. We help you with documentation and processing.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 20 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Visa Type Filter */}
            <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Visa Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {visaTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setVisaTypeFilter("all");
              }}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : filteredVisas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-600 text-lg">No visas found matching your criteria.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisas.map((visa, index) => (
              <motion.div
                key={visa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() =>
                    setExpandedVisa(expandedVisa === visa.id ? null : visa.id)
                  }
                >
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-amber-600" />
                          <CardTitle className="text-xl">{visa.country}</CardTitle>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 capitalize">
                          {visa.visa_type} Visa
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                          <Clock className="w-4 h-4" />
                          <span>Processing</span>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {visa.processing_time_days} days
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Price</span>
                        </div>
                        <p className="font-semibold text-green-900">
                          ₱{visa.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-sm text-slate-600 mb-1">Validity</p>
                      <p className="font-semibold text-slate-900">
                        {visa.validity_months} months
                      </p>
                    </div>

                    {/* Expandable Details */}
                    {expandedVisa === visa.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-4"
                      >
                        {visa.description && (
                          <div>
                            <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Details
                            </p>
                            <p className="text-sm text-slate-700">{visa.description}</p>
                          </div>
                        )}

                        {visa.requirements && visa.requirements.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-900 mb-2">
                              Required Documents
                            </p>
                            <ul className="text-sm text-slate-700 space-y-1">
                              {visa.requirements.map((req, idx) => (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-green-600">✓</span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Button className="w-full bg-amber-600 hover:bg-amber-700 mt-4">
                          Apply Now
                        </Button>
                      </motion.div>
                    )}

                    {expandedVisa !== visa.id && (
                      <p className="text-xs text-slate-500 text-center py-2">
                        Click to view details
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}