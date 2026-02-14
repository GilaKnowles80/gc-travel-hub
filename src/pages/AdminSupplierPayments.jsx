import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, CheckCircle, Clock, Ban, TrendingUp, Zap, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";

export default function AdminSupplierPayments() {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["supplier-payments"],
    queryFn: () => base44.entities.SupplierPayment.list("-created_date"),
    enabled: user?.role === "admin",
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, payment }) => {
      const updated = await base44.entities.SupplierPayment.update(id, data);
      
      // Fetch booking to get customer email
      const entityMap = {
        flight: 'FlightBooking',
        hotel: 'HotelBooking',
        tour: 'Booking',
        ferry: 'FerryBooking',
        bus: 'BusBooking',
        car_rental: 'CarRentalBooking',
      };
      
      const bookings = await base44.entities[entityMap[payment.booking_type]].filter({ 
        id: payment.booking_id 
      });
      
      if (bookings[0]) {
        const customerEmail = bookings[0].passenger_email || bookings[0].customer_email || bookings[0].guest_email || bookings[0].driver_email;
        
        // Notify customer
        await base44.functions.invoke('sendNotification', {
          userEmail: customerEmail,
          title: "Booking Confirmed with Supplier",
          message: "Your booking has been forwarded to our supplier and is being processed. You'll receive updates soon.",
          type: "supplier_payment_done",
          bookingId: payment.booking_id,
          link: "/my-bookings"
        });
      }
      
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-payments"]);
      setShowDialog(false);
      setSelectedPayment(null);
      toast.success("Payment updated");
    },
  });

  const triggerPayoutMutation = useMutation({
    mutationFn: (paymentId) => base44.functions.invoke('triggerSupplierPayout', { paymentId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-payments"]);
      toast.success("Payout initiated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Payout failed");
    },
  });

  const handleMarkAsPaid = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateMutation.mutate({
      id: selectedPayment.id,
      payment: selectedPayment,
      data: {
        payment_status: "paid",
        payment_date: formData.get("payment_date"),
        payment_reference: formData.get("payment_reference"),
        payment_method: formData.get("payment_method"),
        notes: formData.get("notes"),
      },
    });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Access Denied</p>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.payment_status === "pending");
  const paidPayments = payments.filter(p => p.payment_status === "paid");
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.supplier_amount || 0), 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + (p.supplier_amount || 0), 0);
  const totalMarkup = payments.reduce((sum, p) => sum + (p.markup_retained || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                Supplier Payments & Profit Tracking
              </h1>
              <p className="text-slate-600">Manage payments to suppliers and track your retained markup</p>
            </div>
            <Link to={createPageUrl("AdminSupplierBankAccounts")}>
              <Button variant="outline" className="gap-2">
                <Building2 className="w-4 h-4" />
                Manage Supplier Bank Accounts
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-amber-600">₱{totalPending.toLocaleString()}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Paid to Suppliers</p>
                  <p className="text-2xl font-bold text-green-600">₱{totalPaid.toLocaleString()}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Your Total Markup</p>
                  <p className="text-2xl font-bold text-blue-600">₱{totalMarkup.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Count</p>
                  <p className="text-2xl font-bold text-slate-700">{pendingPayments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Payments ({pendingPayments.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidPayments.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Payments ({payments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingPayments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  No pending payments to suppliers
                </CardContent>
              </Card>
            ) : (
              pendingPayments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {payment.booking_type.toUpperCase()} Booking
                          <Badge variant="outline" className="capitalize">{payment.supplier}</Badge>
                        </CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          Booking ID: {payment.booking_id?.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <Badge className="bg-amber-500">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-slate-500">Customer Paid</p>
                        <p className="font-semibold text-lg text-green-600">
                          ₱{payment.customer_paid_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">To Supplier</p>
                        <p className="font-semibold text-lg text-red-600">
                          ₱{payment.supplier_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Your Markup</p>
                        <p className="font-semibold text-lg text-blue-600">
                          ₱{payment.markup_retained?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Profit %</p>
                        <p className="font-semibold text-lg text-blue-600">
                          {((payment.markup_retained / payment.customer_paid_amount) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => triggerPayoutMutation.mutate(payment.id)}
                        disabled={triggerPayoutMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        {triggerPayoutMutation.isPending ? "Processing..." : "Auto Payout (PayMongo)"}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDialog(true);
                        }}
                        variant="outline"
                      >
                        Mark Manually
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paidPayments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {payment.booking_type.toUpperCase()} Booking
                        <Badge variant="outline" className="capitalize">{payment.supplier}</Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        Booking ID: {payment.booking_id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <Badge className="bg-green-500">Paid</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Customer Paid</p>
                      <p className="font-semibold">₱{payment.customer_paid_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid to Supplier</p>
                      <p className="font-semibold">₱{payment.supplier_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Your Markup</p>
                      <p className="font-semibold text-blue-600">₱{payment.markup_retained?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Payment Date</p>
                      <p className="font-semibold">{payment.payment_date || "N/A"}</p>
                    </div>
                  </div>
                  {payment.payment_reference && (
                    <div className="bg-slate-50 rounded-lg p-3 text-sm">
                      <p className="text-slate-600">Reference: <span className="font-mono font-semibold">{payment.payment_reference}</span></p>
                      {payment.payment_method && <p className="text-slate-600 mt-1">Method: {payment.payment_method}</p>}
                      {payment.notes && <p className="text-slate-600 mt-1">Notes: {payment.notes}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {payment.booking_type.toUpperCase()} Booking
                        <Badge variant="outline" className="capitalize">{payment.supplier}</Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        Booking ID: {payment.booking_id?.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <Badge className={
                      payment.payment_status === "paid" ? "bg-green-500" :
                      payment.payment_status === "pending" ? "bg-amber-500" : "bg-red-500"
                    }>
                      {payment.payment_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Customer Paid</p>
                      <p className="font-semibold">₱{payment.customer_paid_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">To Supplier</p>
                      <p className="font-semibold">₱{payment.supplier_amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Your Markup</p>
                      <p className="font-semibold text-blue-600">₱{payment.markup_retained?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Profit %</p>
                      <p className="font-semibold text-blue-600">
                        {((payment.markup_retained / payment.customer_paid_amount) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Mark as Paid Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Payment as Paid</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleMarkAsPaid} className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount to Pay:</span>
                  <span className="font-bold text-lg">₱{selectedPayment?.supplier_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Supplier:</span>
                  <span className="font-semibold capitalize">{selectedPayment?.supplier}</span>
                </div>
              </div>

              <div>
                <Label>Payment Date</Label>
                <Input type="date" name="payment_date" required defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              <div>
                <Label>Payment Reference/Transaction ID</Label>
                <Input name="payment_reference" placeholder="e.g., BANK-REF-12345" required />
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select name="payment_method" defaultValue="manual">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea name="notes" placeholder="Any additional notes..." rows={3} />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                  {updateMutation.isPending ? "Saving..." : "Confirm Payment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Export Report Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Supplier Payments Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={exportFilters.startDate}
                  onChange={(e) => setExportFilters({ ...exportFilters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={exportFilters.endDate}
                  onChange={(e) => setExportFilters({ ...exportFilters, endDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select value={exportFilters.supplier} onValueChange={(value) => setExportFilters({ ...exportFilters, supplier: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    <SelectItem value="biyaheko">Biyaheko</SelectItem>
                    <SelectItem value="wanderlinx">Wanderlinx</SelectItem>
                    <SelectItem value="tripzynx">Tripzynx</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={exportFilters.status} onValueChange={(value) => setExportFilters({ ...exportFilters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportReport} className="w-full bg-amber-600 hover:bg-amber-700">
                <Download className="w-4 h-4 mr-2" />
                Download CSV Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}