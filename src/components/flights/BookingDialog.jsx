import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/pages/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import BookingConfirmationStep from "./BookingConfirmationStep";

export default function BookingDialog({ isOpen, onClose, flightOffer, passengers }) {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [bookingData, setBookingData] = useState(null);
    const [travelers, setTravelers] = useState(
        Array.from({ length: passengers }, (_, i) => ({
            id: `${i + 1}`,
            dateOfBirth: "",
            name: {
                firstName: "",
                lastName: ""
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
            setCurrentStep(4);
            toast.success('Flight booked successfully!');
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to book flight');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        for (let i = 0; i < travelers.length; i++) {
            const t = travelers[i];
            if (!t.name.firstName || !t.name.lastName || !t.dateOfBirth) {
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

    const handleCompleteBooking = () => {
        sessionStorage.setItem('bookingConfirmation', JSON.stringify(bookingData));
        navigate(createPageUrl('BookingConfirmation'));
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
                    {[1, 2, 3, 4].map((step) => (
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
                        currentStep >= 4 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-slate-200 text-slate-600'
                    }`}>
                        {currentStep > 4 ? <CheckCircle2 className="w-5 h-5" /> : 4}
                    </div>
                </div>

                {currentStep === 1 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                    {travelers.map((traveler, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-amber-600" />
                                <h3 className="font-semibold">Passenger {idx + 1}</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>First Name *</Label>
                                    <Input
                                        value={traveler.name.firstName}
                                        onChange={(e) => updateTraveler(idx, 'name.firstName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={traveler.name.lastName}
                                        onChange={(e) => updateTraveler(idx, 'name.lastName', e.target.value)}
                                        required
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
                                    <Label>Gender</Label>
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-background px-3"
                                        value={traveler.gender}
                                        onChange={(e) => updateTraveler(idx, 'gender', e.target.value)}
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                            </div>

                            {idx === 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={traveler.contact.emailAddress}
                                            onChange={(e) => updateTraveler(idx, 'contact.emailAddress', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={traveler.contact.phones[0].number}
                                            onChange={(e) => {
                                                const phones = [...traveler.contact.phones];
                                                phones[0].number = e.target.value;
                                                updateTraveler(idx, 'contact', { ...traveler.contact, phones });
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
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

                {currentStep === 4 && bookingData && (
                    <BookingConfirmationStep 
                        booking={bookingData}
                        onComplete={handleCompleteBooking}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}