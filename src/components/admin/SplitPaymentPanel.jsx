import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Clock, Upload } from "lucide-react";
import { toast } from "sonner";

export default function SplitPaymentPanel() {
    const [paymentProof, setPaymentProof] = useState({});
    const queryClient = useQueryClient();

    const { data: pendingPayments = [] } = useQuery({
        queryKey: ["pending-supplier-payments"],
        queryFn: async () => {
            return await base44.entities.SupplierPayment.filter({ payment_status: "pending" });
        }
    });

    const paySupplierMutation = useMutation({
        mutationFn: async ({ paymentId, proof }) => {
            const { data } = await base44.functions.invoke('autoPaySupplier', {
                supplierPaymentId: paymentId,
                paymentProof: proof
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-supplier-payments"] });
            toast.success("Supplier payment marked as paid!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to process payment");
        }
    });

    const handleFileUpload = async (paymentId, file) => {
        if (!file) return;
        
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setPaymentProof(prev => ({ ...prev, [paymentId]: file_url }));
            toast.success("Proof uploaded!");
        } catch (error) {
            toast.error("Failed to upload proof");
        }
    };

    const handlePaySupplier = (paymentId) => {
        paySupplierMutation.mutate({
            paymentId,
            proof: paymentProof[paymentId] || null
        });
    };

    const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount_due || 0), 0);
    const totalMarkup = pendingPayments.reduce((sum, p) => sum + (p.markup_amount || 0), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Split Payment Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Pending Supplier Payments</p>
                        <p className="text-2xl font-bold text-red-600">₱{totalPending.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600">Your Markup Retained</p>
                        <p className="text-2xl font-bold text-green-600">₱{totalMarkup.toLocaleString()}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {pendingPayments.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">No pending supplier payments</p>
                    ) : (
                        pendingPayments.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold">{payment.supplier_name}</h4>
                                        <p className="text-sm text-slate-600">Booking: {payment.booking_id}</p>
                                        <p className="text-xs text-slate-500">{payment.booking_type}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-amber-50">
                                        <Clock className="w-3 h-3 mr-1" />
                                        Pending
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                        <p className="text-slate-600">Due to Supplier</p>
                                        <p className="font-bold">₱{payment.amount_due?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Your Markup</p>
                                        <p className="font-bold text-green-600">₱{payment.markup_amount?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-600">Markup %</p>
                                        <p className="font-bold">{payment.markup_percentage?.toFixed(1)}%</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Upload Payment Proof (Optional)</Label>
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={(e) => handleFileUpload(payment.id, e.target.files[0])}
                                        className="text-sm"
                                    />
                                    {paymentProof[payment.id] && (
                                        <p className="text-xs text-green-600">✓ Proof uploaded</p>
                                    )}
                                </div>

                                <Button
                                    onClick={() => handlePaySupplier(payment.id)}
                                    disabled={paySupplierMutation.isPending}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    size="sm"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark as Paid
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}