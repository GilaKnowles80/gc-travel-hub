import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/pages/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import BookingConfirmationStep from "./BookingConfirmationStep";
import PaymentMethodSelector from "./PaymentMethodSelector";
import ItineraryReceipt from "./ItineraryReceipt";

export default function BookingDialog({ isOpen, onClose, flightOffer, passengers }) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [travelers, setTravelers] = useState(
        Array.from({ length: passengers }, (_, i) => ({
            id: `${i + 1}`,
            title: "MR",
            dateOfBirth: "",
            name: {
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: ""
            },
            gender: "MALE",
            contact: {
                emailAddress: "",
                phones: [{
                    deviceType: "MOBILE",
                    countryCallingCode: "63",
                    number: ""
                }]
            },
            governmentId: {
                type: "PASSPORT",
                number: ""
            },
            documents: [{
                documentType: "PASSPORT",
                birthPlace: "",
                issuanceLocation: "",
                issuanceDate: "",
                number: "",
                expiryDate: "",
                issuanceCountry: "PH",
                validityCountry: "PH",
                nationality: "PH",
                holder: true
            }]
        }))
    );

    const { data: currentUser } = useQuery({
        queryKey: ["current-user"],
        queryFn: async () => await base44.auth.me()
    });

    const { data: savedTravelers } = useQuery({
        queryKey: ["saved-travelers", currentUser?.email],
        queryFn: async () => {
            const result = await base44.entities.SavedTraveler.filter({ user_email: currentUser.email });
            return result || [];
        },
        enabled: !!currentUser?.email
    });

    const bookingMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('bookFlight', {
                flightOffer,
                passengerDetails: {
                    travelers,
                    phone: travelers[0]?.contact?.phones[0]?.number
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            setBookingData(data);
            setCurrentStep(2);
            toast.success('Passenger details saved!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to book flight');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if running in iframe
        if (window.self !== window.top) {
            toast.error("Checkout must be completed in the main app window");
            return;
        }
        
        // Basic validation
        for (let i = 0; i < travelers.length; i++) {
            const t = travelers[i];
            if (!t.name.firstName || !t.name.lastName || !t.dateOfBirth || !t.governmentId.number || !t.contact.emailAddress || !t.contact.phones[0].number || !t.documents[0].nationality) {
                toast.error(`Please fill all required fields for passenger ${i + 1}`);
                return;
            }
        }

        bookingMutation.mutate();
    };

    const updateTraveler = (index, field, value) => {
        setTravelers(prev => {
            const updated = [...prev];
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                updated[index][parent][child] = value;
            } else {
                updated[index][field] = value;
            }
            return updated;
        });
    };

    const fillFromSavedTraveler = (index, savedTraveler) => {
        const updated = [...travelers];
        updated[index] = {
            ...updated[index],
            title: "MR",
            dateOfBirth: savedTraveler.date_of_birth || "",
            name: {
                firstName: savedTraveler.first_name || "",
                middleName: "",
                lastName: savedTraveler.last_name || "",
                suffix: ""
            },
            gender: savedTraveler.gender || "MALE",
            contact: {
                emailAddress: savedTraveler.email || "",
                phones: [{
                    deviceType: "MOBILE",
                    countryCallingCode: "63",
                    number: savedTraveler.phone || ""
                }]
            },
            governmentId: {
                type: "PASSPORT",
                number: savedTraveler.passport_number || ""
            },
            documents: [{
                documentType: "PASSPORT",
                birthPlace: "",
                issuanceLocation: "",
                issuanceDate: "",
                number: savedTraveler.passport_number || "",
                expiryDate: savedTraveler.passport_expiry || "",
                issuanceCountry: savedTraveler.passport_country || "PH",
                validityCountry: "PH",
                nationality: savedTraveler.nationality || "PH",
                holder: true
            }]
        };
        setTravelers(updated);
        toast.success(`Filled passenger ${index + 1} from saved traveler`);
    };

    const handleCompleteBooking = () => {
        toast.success('Booking completed! Check My Bookings to view your ticket.');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Complete Your Booking</DialogTitle>
                </DialogHeader>

                {/* Step Indicators */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <div key={step} className="flex-1 flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                currentStep >= step 
                                    ? 'bg-amber-500 text-white' 
                                    : 'bg-slate-200 text-slate-600'
                            }`}>
                                {currentStep > step ? <CheckCircle2 className="w-5 h-5" /> : step}
                            </div>
                            <div className={`flex-1 h-1 mx-2 ${
                                currentStep > step ? 'bg-amber-500' : 'bg-slate-200'
                            }`}></div>
                        </div>
                    ))}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        currentStep >= 5 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-200 text-slate-600'
                    }`}>
                        {currentStep > 5 ? <CheckCircle2 className="w-5 h-5" /> : 5}
                    </div>
                </div>

                {currentStep === 1 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                    {travelers.map((traveler, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-amber-600" />
                                    <h3 className="font-semibold">Passenger {idx + 1}</h3>
                                </div>
                                {savedTravelers && savedTravelers.length > 0 && (
                                    <div className="text-xs">
                                        <span className="text-slate-600 mr-2">Quick fill:</span>
                                        <div className="space-x-1 inline-flex">
                                            {savedTravelers.map((st) => (
                                                <Button
                                                    key={st.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs py-1 h-auto"
                                                    onClick={() => fillFromSavedTraveler(idx, st)}
                                                >
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    {st.label || `${st.first_name} ${st.last_name}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Title *</Label>
                                    <Select value={traveler.title} onValueChange={(val) => updateTraveler(idx, 'title', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MR">Mr.</SelectItem>
                                            <SelectItem value="MRS">Mrs.</SelectItem>
                                            <SelectItem value="MS">Ms.</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>First Name *</Label>
                                    <Input
                                        value={traveler.name.firstName}
                                        onChange={(e) => updateTraveler(idx, 'name.firstName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Middle Name</Label>
                                    <Input
                                        value={traveler.name.middleName}
                                        onChange={(e) => updateTraveler(idx, 'name.middleName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={traveler.name.lastName}
                                        onChange={(e) => updateTraveler(idx, 'name.lastName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Suffix</Label>
                                    <Input
                                        value={traveler.name.suffix}
                                        onChange={(e) => updateTraveler(idx, 'name.suffix', e.target.value)}
                                        placeholder="Jr., Sr., III, etc."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Date of Birth *</Label>
                                    <Input
                                        type="date"
                                        value={traveler.dateOfBirth}
                                        onChange={(e) => updateTraveler(idx, 'dateOfBirth', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Gender *</Label>
                                    <Select value={traveler.gender} onValueChange={(val) => updateTraveler(idx, 'gender', val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nationality *</Label>
                                    <Input
                                        value={traveler.documents[0].nationality}
                                        onChange={(e) => {
                                            const docs = [...traveler.documents];
                                            docs[0].nationality = e.target.value;
                                            updateTraveler(idx, 'documents', docs);
                                        }}
                                        placeholder="e.g., PH, US, JP"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        value={traveler.contact.emailAddress}
                                        onChange={(e) => updateTraveler(idx, 'contact.emailAddress', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label>Contact Number *</Label>
                                    <Input
                                        value={traveler.contact.phones[0].number}
                                        onChange={(e) => {
                                            const phones = [...traveler.contact.phones];
                                            phones[0].number = e.target.value;
                                            updateTraveler(idx, 'contact', { ...traveler.contact, phones });
                                        }}
                                        placeholder="+63 XXX XXX XXXX"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Government ID Type *</Label>
                                    <Select 
                                        value={traveler.governmentId.type} 
                                        onValueChange={(val) => {
                                            const updated = { ...traveler.governmentId, type: val };
                                            updateTraveler(idx, 'governmentId', updated);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PASSPORT">Passport</SelectItem>
                                            <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                                            <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                                            <SelectItem value="SSS">SSS ID</SelectItem>
                                            <SelectItem value="UMID">UMID</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Government ID Number *</Label>
                                    <Input
                                        value={traveler.governmentId.number}
                                        onChange={(e) => {
                                            const updated = { ...traveler.governmentId, number: e.target.value };
                                            updateTraveler(idx, 'governmentId', updated);
                                        }}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600"
                            disabled={bookingMutation.isPending}
                        >
                            {bookingMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                'Confirm Booking'
                            )}
                        </Button>
                    </div>
                    </form>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <PaymentMethodSelector 
                            selectedMethod={selectedPaymentMethod}
                            onSelect={setSelectedPaymentMethod}
                        />
                        <div className="flex gap-3 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!selectedPaymentMethod) {
                                        toast.error('Please select a payment method');
                                        return;
                                    }
                                    setCurrentStep(3);
                                }}
                                className="bg-amber-500 hover:bg-amber-600"
                            >
                                Continue to Payment
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 4 && bookingData && (
                    <BookingConfirmationStep 
                        booking={bookingData}
                        onComplete={() => setCurrentStep(5)}
                    />
                )}

                {currentStep === 5 && bookingData && (
                    <ItineraryReceipt
                        booking={bookingData}
                        flight={flightOffer}
                        onClose={handleCompleteBooking}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}