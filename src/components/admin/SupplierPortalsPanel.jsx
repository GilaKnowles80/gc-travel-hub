import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, ExternalLink, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

export default function SupplierPortalsPanel() {
  const [editing, setEditing] = React.useState(false);
  const [showPasswords, setShowPasswords] = React.useState({});
  const [formData, setFormData] = React.useState({
    biyaheko_terminal_id: "",
    biyaheko_user_id: "",
    biyaheko_password: "",
    wanderlinx_email: "",
    wanderlinx_password: "",
    tripzynx_username: "",
    tripzynx_password: ""
  });

  const queryClient = useQueryClient();

  const { data: credentials } = useQuery({
    queryKey: ['supplier-credentials'],
    queryFn: async () => {
      const creds = await base44.entities.SupplierCredentials.list();
      return creds[0] || null;
    }
  });

  React.useEffect(() => {
    if (credentials) {
      setFormData(credentials);
    }
  }, [credentials]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (credentials?.id) {
        return await base44.entities.SupplierCredentials.update(credentials.id, data);
      } else {
        return await base44.entities.SupplierCredentials.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-credentials'] });
      setEditing(false);
      toast.success("Credentials saved");
    }
  });

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const openPortalWithCredentials = async (supplier) => {
    const fieldsToCopy = supplier.fields.map(f => `${f.label}: ${formData[f.key] || ''}`).join('\n');
    await navigator.clipboard.writeText(fieldsToCopy);
    window.open(supplier.url, '_blank');
    toast.success(`Credentials copied - Portal opened`);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const suppliers = [
    {
      name: "Biyaheko.ph",
      url: "https://biyaheko.ph",
      fields: [
        { key: "biyaheko_terminal_id", label: "Terminal ID" },
        { key: "biyaheko_user_id", label: "User ID" },
        { key: "biyaheko_password", label: "Password", type: "password" }
      ]
    },
    {
      name: "Wanderlinx",
      url: "https://mywanderlinx.com",
      fields: [
        { key: "wanderlinx_email", label: "Email" },
        { key: "wanderlinx_password", label: "Password", type: "password" }
      ]
    },
    {
      name: "Tripzynx",
      url: "https://tripzynx.com",
      fields: [
        { key: "tripzynx_username", label: "Email/Username" },
        { key: "tripzynx_password", label: "Password", type: "password" }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Supplier Portal Access</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editing ? saveMutation.mutate(formData) : setEditing(true)}
        >
          {editing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          ) : (
            "Edit Credentials"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {suppliers.map((supplier) => (
            <div key={supplier.name} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{supplier.name}</h3>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => openPortalWithCredentials(supplier)}
                  className="bg-amber-600 hover:bg-amber-700 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy & Open
                </Button>
              </div>

              <div className="space-y-2">
                {supplier.fields.map((field) => (
                  <div key={field.key}>
                    <Label className="text-xs text-slate-600">{field.label}</Label>
                    <div className="flex gap-1 mt-1">
                      {editing ? (
                        <Input
                          type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                          value={formData[field.key] || ""}
                          onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          className="text-sm"
                        />
                      ) : (
                        <Input
                          type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                          value={formData[field.key] || ""}
                          readOnly
                          className="text-sm bg-slate-50"
                        />
                      )}
                      {field.type === "password" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => togglePasswordVisibility(field.key)}
                        >
                          {showPasswords[field.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(formData[field.key], field.label)}
                        disabled={!formData[field.key]}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}