import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCorporateClients() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    discount_percentage: 5,
    credit_limit: 0,
    payment_terms: "immediate",
    status: "active",
    tax_id: "",
    billing_address: "",
    notes: ""
  });
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["corporate-clients"],
    queryFn: () => base44.entities.CorporateClient.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CorporateClient.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-clients"] });
      toast.success("Corporate client created!");
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CorporateClient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["corporate-clients"] });
      toast.success("Corporate client updated!");
      setShowDialog(false);
      resetForm();
    }
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      contact_person: "",
      email: "",
      phone: "",
      discount_percentage: 5,
      credit_limit: 0,
      payment_terms: "immediate",
      status: "active",
      tax_id: "",
      billing_address: "",
      notes: ""
    });
    setEditingClient(null);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingClient) {
      updateMutation.mutate({ id: editingClient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-500" />
              Corporate Clients
            </h1>
            <p className="text-slate-600">Manage corporate accounts and discounts</p>
          </div>
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="grid gap-4">
          {clients.map(client => (
            <Card key={client.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{client.company_name}</h3>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Contact: {client.contact_person}</p>
                        <p className="text-slate-600">Email: {client.email}</p>
                        <p className="text-slate-600">Phone: {client.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Discount: <span className="font-bold text-green-600">{client.discount_percentage}%</span></p>
                        <p className="text-slate-600">Credit Limit: ₱{client.credit_limit?.toLocaleString()}</p>
                        <p className="text-slate-600">Payment Terms: {client.payment_terms}</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(client)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit' : 'Add'} Corporate Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
                </div>
                <div>
                  <Label>Contact Person</Label>
                  <Input value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <Label>Discount %</Label>
                  <Input type="number" value={formData.discount_percentage} onChange={(e) => setFormData({...formData, discount_percentage: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label>Credit Limit</Label>
                  <Input type="number" value={formData.credit_limit} onChange={(e) => setFormData({...formData, credit_limit: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <Label>Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => setFormData({...formData, payment_terms: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="net_7">Net 7 Days</SelectItem>
                      <SelectItem value="net_15">Net 15 Days</SelectItem>
                      <SelectItem value="net_30">Net 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingClient ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}