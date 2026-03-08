import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MobileSelect } from "@/components/ui/mobile-select";
import { Loader2, User, CreditCard, Copy } from "lucide-react";
import { toast } from "sonner";
import PriceDisplay from "@/components/currency/PriceDisplay";

export default function HotelBookingDialog({ isOpen, onClose, hotel, offer, guests }) {
    const [guestDetails, setGuestDetails] = useState(
        Array.from({ length: guests }, (_, i) => ({
            id: i + 1,
            name: {
                title: "MR",
                firstName: "",
                middleName: "",
                lastName: "",
                suffix: ""
            },
            dateOfBirth: "",
            nationality: "PH",
            governmentId: {
                type: "PASSPORT",
                number: ""
            },
            contact: {
                phone: "",
                email: ""
            }
        }))
    );

    const { data: currentUser } = useQuery({
        queryKey: ["current-user"],
        queryFn: async () => await base44.auth.me()
    });

    const { data: savedGuests } = useQuery({
        queryKey: ["saved-guests", currentUser?.email],
        queryFn: async () => {
            const result = await base44.entities.SavedGuest.filter({ user_email: currentUser.email });
            return result || [];
        },
        enabled: !!currentUser?.email
    });

    const bookingMutation = useMutation({
        mutationFn: async () => {
            let booking_ref = null;
            try {
                const refRes = await base44.functions.invoke('generateBookingRef', { product_type: 'hotel' });
                booking_ref = refRes?.data?.booking_ref || null;
            } catch (e) { console.error('Could not generate booking ref', e); }

            try {
                const response = await base44.functions.invoke('createHotelCheckout', {
                    hotel,
                    offer,
                    guestDetails: {
                        guests: guestDetails
                    },
                    booking_ref
                });
                return response.data;
            } catch (error) {
                throw new Error(error.message || 'Failed to create checkout session');
            }
        },
        onSuccess: (data) => {
            if (!data.url) {
                toast.error('Invalid checkout session. Please try again.');
                return;
            }
            // Redirect to Stripe Checkout
            window.location.href = data.url;
        },
        onError: (error) => {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to create checkout. Please try again.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if running in iframe
        if (window.self !== window.top) {
            toast.error("Checkout must be completed in the main app window");
            return;
        }
        
        for (let i = 0; i < guestDetails.length; i++) {
            const g = guestDetails[i];
            if (!g.name.firstName || !g.name.lastName || !g.dateOfBirth || !g.governmentId.number || !g.contact.email || !g.contact.phone) {
                toast.error(`Please fill all required fields for guest ${i + 1}`);
                return;
            }
        }

        bookingMutation.mutate();
    };

    const updateGuest = (index, field, value) => {
        setGuestDetails(prev => {
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

    const fillFromSavedGuest = (index, savedGuest) => {
        const updated = [...guestDetails];
        updated[index] = {
            ...updated[index],
            name: {
                title: savedGuest.title || "MR",
                firstName: savedGuest.first_name || "",
                middleName: "",
                lastName: savedGuest.last_name || "",
                suffix: ""
            },
            dateOfBirth: "",
            nationality: "PH",
            governmentId: {
                type: "PASSPORT",
                number: ""
            },
            contact: {
                phone: savedGuest.phone || "",
                email: savedGuest.email || ""
            }
        };
        setGuestDetails(updated);
        toast.success(`Filled guest ${index + 1} from saved guest`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Guest Information</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {guestDetails.map((guest, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    <h3 className="font-semibold">Guest {idx + 1}</h3>
                                </div>
                                {savedGuests && savedGuests.length > 0 && (
                                    <div className="text-xs">
                                        <span className="text-slate-600 mr-2">Quick fill:</span>
                                        <div className="space-x-1 inline-flex">
                                            {savedGuests.map((sg) => (
                                                <Button
                                                    key={sg.id}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs py-1 h-auto"
                                                    onClick={() => fillFromSavedGuest(idx, sg)}
                                                >
                                                    <Copy className="w-3 h-3 mr-1" />
                                                    {sg.label || `${sg.first_name} ${sg.last_name}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Title *</Label>
                                    <MobileSelect value={guest.name.title} onValueChange={(val) => updateGuest(idx, 'name.title', val)} placeholder="Select title">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MR">Mr.</SelectItem>
                                            <SelectItem value="MRS">Mrs.</SelectItem>
                                            <SelectItem value="MS">Ms.</SelectItem>
                                        </SelectContent>
                                    </MobileSelect>
                                </div>
                                <div>
                                    <Label>First Name *</Label>
                                    <Input
                                        value={guest.name.firstName}
                                        onChange={(e) => updateGuest(idx, 'name.firstName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Middle Name</Label>
                                    <Input
                                        value={guest.name.middleName}
                                        onChange={(e) => updateGuest(idx, 'name.middleName', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={guest.name.lastName}
                                        onChange={(e) => updateGuest(idx, 'name.lastName', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Suffix</Label>
                                    <Input
                                        value={guest.name.suffix}
                                        onChange={(e) => updateGuest(idx, 'name.suffix', e.target.value)}
                                        placeholder="Jr., Sr., III"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Birthdate *</Label>
                                    <Input
                                        type="date"
                                        value={guest.dateOfBirth}
                                        onChange={(e) => updateGuest(idx, 'dateOfBirth', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Nationality *</Label>
                                    <Input
                                        value={guest.nationality}
                                        onChange={(e) => updateGuest(idx, 'nationality', e.target.value)}
                                        placeholder="PH"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Email Address *</Label>
                                    <Input
                                        type="email"
                                        value={guest.contact.email}
                                        onChange={(e) => updateGuest(idx, 'contact.email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Contact Number *</Label>
                                    <Input
                                        value={guest.contact.phone}
                                        onChange={(e) => updateGuest(idx, 'contact.phone', e.target.value)}
                                        placeholder="+63 XXX XXX XXXX"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Government ID *</Label>
                                    <MobileSelect 
                                        value={guest.governmentId.type} 
                                        onValueChange={(val) => {
                                            const updated = { ...guest.governmentId, type: val };
                                            updateGuest(idx, 'governmentId', updated);
                                        }}
                                        placeholder="Select ID type"
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
                                    </MobileSelect>
                                </div>
                                <div>
                                    <Label>Government ID Number *</Label>
                                    <Input
                                        value={guest.governmentId.number}
                                        onChange={(e) => {
                                            const updated = { ...guest.governmentId, number: e.target.value };
                                            updateGuest(idx, 'governmentId', updated);
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
                            className="bg-blue-500 hover:bg-blue-600"
                            disabled={bookingMutation.isPending}
                        >
                            {bookingMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Proceed to Payment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}