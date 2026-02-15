import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, Plus, Upload, Download, Percent } from "lucide-react";
import { toast } from "sonner";

export default function CorporateBooking() {
  const [step, setStep] = useState(1);
  const [corporateClientId, setCorporateClientId] = useState("");
  const [bookingType, setBookingType] = useState("flight");
  const [itemId, setItemId] = useState("");
  const [passengers, setPassengers] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState("");
  const queryClient = useQueryClient();

  const { data: corporateClients = [] } = useQuery({
    queryKey: ["corporate-clients"],
    queryFn: () => base44.entities.CorporateClient.filter({ status: "active" })
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ["supplier-promotions"],
    queryFn: () => base44.entities.SupplierPromotion.filter({ status: "active" })
  });

  const selectedClient = corporateClients.find(c => c.id === corporateClientId);
  const applicablePromos = promotions.filter(p => p.applicable_to?.includes(bookingType));

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n').slice(1); // Skip header
      const parsedPassengers = rows.filter(row => row.trim()).map(row => {
        const [title, firstName, middleName, lastName, suffix, birthdate, contact, email, idType, idNumber, nationality] = row.split(',');
        return {
          title: title?.trim(),
          first_name: firstName?.trim(),
          middle_name: middleName?.trim(),
          last_name: lastName?.trim(),
          suffix: suffix?.trim(),
          birthdate: birthdate?.trim(),
          contact_number: contact?.trim(),
          email: email?.trim(),
          government_id_type: idType?.trim(),
          government_id_number: idNumber?.trim(),
          nationality: nationality?.trim()
        };
      });
      setPassengers(parsedPassengers);
      toast.success(`Uploaded ${parsedPassengers.length} passengers`);
    };
    reader.readAsText(file);
  };

  const downloadCSVTemplate = () => {
    const template = "Title,First Name,Middle Name,Last Name,Suffix,Birthdate,Contact Number,Email,ID Type,ID Number,Nationality\nMR,John,A,Doe,,1990-01-01,+639123456789,john@company.com,Passport,P1234567,Filipino";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-passengers-template.csv';
    a.click();
  };

  const load20Passengers = async () => {
    try {
      const savedTravelers = await base44.entities.SavedTraveler.list();
      const loaded = savedTravelers.slice(0, 20).map(traveler => ({
        title: traveler.gender === "MALE" ? "MR" : "MS",
        first_name: traveler.first_name,
        middle_name: "",
        last_name: traveler.last_name,
        suffix: "",
        birthdate: traveler.date_of_birth,
        contact_number: traveler.phone || "+639000000000",
        email: traveler.email,
        government_id_type: "Passport",
        government_id_number: traveler.passport_number || "P0000000",
        nationality: traveler.nationality || "Filipino",
        passport_number: traveler.passport_number,
        passport_expiry: traveler.passport_expiry
      }));
      setPassengers(loaded);
      toast.success(`Loaded ${loaded.length} passengers`);
    } catch (error) {
      toast.error("Failed to load passengers");
    }
  };

  const addPassenger = () => {
    setPassengers([...passengers, {
      title: "MR",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      birthdate: "",
      contact_number: "",
      email: "",
      government_id_type: "Passport",
      government_id_number: "",
      nationality: "Filipino"
    }]);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const createBulkBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const booking = await base44.entities.BulkBooking.create(bookingData);
      
      // Process split payment
      await base44.functions.invoke('processSplitPayment', {
        bookingId: booking.id,
        bookingType: bookingData.booking_type,
        totalAmount: bookingData.final_price,
        supplier: bookingData.supplier,
        supplierCost: bookingData.supplier_cost
      });

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bulk-bookings"] });
      toast.success("Bulk booking created successfully!");
      setStep(1);
      setPassengers([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create bulk booking");
    }
  });

  const handleSubmit = () => {
    if (!corporateClientId || !itemId || passengers.length === 0) {
      toast.error("Please complete all required fields");
      return;
    }

    const basePrice = 5000; // Replace with actual price
    const totalBase = basePrice * passengers.length;
    const discountPercent = selectedClient?.discount_percentage || 0;
    const promoDiscount = selectedPromo ? (applicablePromos.find(p => p.id === selectedPromo)?.discount_value || 0) : 0;
    const totalDiscount = discountPercent + promoDiscount;
    const discountAmount = totalBase * (totalDiscount / 100);
    const finalPrice = totalBase - discountAmount;

    createBulkBookingMutation.mutate({
      corporate_client_id: corporateClientId,
      booking_type: bookingType,
      item_id: itemId,
      item_name: `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Booking`,
      number_of_passengers: passengers.length,
      passengers,
      base_price: basePrice,
      total_base_price: totalBase,
      discount_percentage: totalDiscount,
      discount_amount: discountAmount,
      final_price: finalPrice,
      supplier: "amadeus",
      supplier_cost: finalPrice * 0.85,
      supplier_promotion: selectedPromo || null,
      status: "pending",
      payment_status: "unpaid"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8 text-amber-500" />
            Corporate Bulk Booking
          </h1>
          <p className="text-slate-600">Create bookings for multiple passengers with corporate discounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Step {step} of 3</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label>Corporate Client</Label>
                  <Select value={corporateClientId} onValueChange={setCorporateClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select corporate client" />
                    </SelectTrigger>
                    <SelectContent>
                      {corporateClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name} ({client.discount_percentage}% discount)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Booking Type</Label>
                  <Select value={bookingType} onValueChange={setBookingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Item ID (Flight/Hotel/Tour ID)</Label>
                  <Input
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="Enter item ID"
                  />
                </div>

                {applicablePromos.length > 0 && (
                  <div>
                    <Label>Supplier Promotion (Optional)</Label>
                    <Select value={selectedPromo} onValueChange={setSelectedPromo}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select promotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicablePromos.map(promo => (
                          <SelectItem key={promo.id} value={promo.id}>
                            {promo.promo_title} ({promo.discount_value}% off - Min {promo.minimum_passengers} pax)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button onClick={() => setStep(2)} className="w-full">
                  Continue to Passengers
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Passengers ({passengers.length})</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Template
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <label>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload CSV
                        <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                      </label>
                    </Button>
                    <Button size="sm" onClick={addPassenger}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {passengers.map((passenger, idx) => (
                    <Card key={idx} className="p-4">
                      <h4 className="font-semibold mb-3">Passenger {idx + 1}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <Input
                          placeholder="First Name"
                          value={passenger.first_name}
                          onChange={(e) => updatePassenger(idx, 'first_name', e.target.value)}
                        />
                        <Input
                          placeholder="Last Name"
                          value={passenger.last_name}
                          onChange={(e) => updatePassenger(idx, 'last_name', e.target.value)}
                        />
                        <Input
                          placeholder="Email"
                          value={passenger.email}
                          onChange={(e) => updatePassenger(idx, 'email', e.target.value)}
                        />
                        <Input
                          placeholder="Contact"
                          value={passenger.contact_number}
                          onChange={(e) => updatePassenger(idx, 'contact_number', e.target.value)}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Review Booking
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && selectedClient && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-amber-600" />
                    Discount Summary
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p>Corporate Discount: {selectedClient.discount_percentage}%</p>
                    {selectedPromo && (
                      <p>Promo Discount: {applicablePromos.find(p => p.id === selectedPromo)?.discount_value}%</p>
                    )}
                    <p className="font-semibold">Total Discount: {(selectedClient.discount_percentage + (selectedPromo ? applicablePromos.find(p => p.id === selectedPromo)?.discount_value : 0))}%</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <p className="text-sm text-slate-600">Passengers: {passengers.length}</p>
                  <p className="text-sm text-slate-600">Booking Type: {bookingType}</p>
                  <p className="text-2xl font-bold text-amber-600 mt-2">
                    Estimated Total: ₱{(5000 * passengers.length * (1 - (selectedClient.discount_percentage + (selectedPromo ? applicablePromos.find(p => p.id === selectedPromo)?.discount_value : 0)) / 100)).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createBulkBookingMutation.isPending}
                    className="flex-1 bg-amber-600 hover:bg-amber-700"
                  >
                    {createBulkBookingMutation.isPending ? "Creating..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}