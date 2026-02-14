import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function HotelBookingDialog({ isOpen, onClose, hotel, offer, guests }) {
    const [guestDetails, setGuestDetails] = useState(
        Array.from({ length: guests }, (_, i) => ({
            id: i + 1,
            name: {
                title: "MR",
                firstName: "",
                lastName: ""
            },
            contact: {
                phone: "",
                email: ""
            }
        }))
    );

    const bookingMutation = useMutation({
        mutationFn: async () => {
            try {
                const response = await base44.functions.invoke('createHotelCheckout', {
                    hotel,
                    offer,
                    guestDetails: {
                        guests: guestDetails
                    }
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
        
        for (let i = 0; i < guestDetails.length; i++) {
            const g = guestDetails[i];
            if (!g.name.firstName || !g.name.lastName) {
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Guest Information</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {guestDetails.map((guest, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-blue-600" />
                                <h3 className="font-semibold">Guest {idx + 1}</h3>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Title</Label>
                                    <select
                                        className="w-full h-9 rounded-md border border-input bg-background px-3"
                                        value={guest.name.title}
                                        onChange={(e) => updateGuest(idx, 'name.title', e.target.value)}
                                    >
                                        <option value="MR">Mr.</option>
                                        <option value="MRS">Mrs.</option>
                                        <option value="MS">Ms.</option>
                                    </select>
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
                                    <Label>Last Name *</Label>
                                    <Input
                                        value={guest.name.lastName}
                                        onChange={(e) => updateGuest(idx, 'name.lastName', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {idx === 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            value={guest.contact.email}
                                            onChange={(e) => updateGuest(idx, 'contact.email', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <Input
                                            value={guest.contact.phone}
                                            onChange={(e) => updateGuest(idx, 'contact.phone', e.target.value)}
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