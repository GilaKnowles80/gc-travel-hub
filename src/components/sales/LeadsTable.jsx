import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Phone, Mail, Calendar } from "lucide-react";
import moment from "moment";

export default function LeadsTable({ leads, onSelectLead, userRole }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filtered = leads.filter(lead => {
    const matchSearch = !search || 
      lead.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.email?.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone?.includes(search);
    
    const matchStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchPriority = priorityFilter === "all" || lead.priority === priorityFilter;
    
    return matchSearch && matchStatus && matchPriority;
  });

  const statusColors = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-purple-100 text-purple-700",
    qualified: "bg-green-100 text-green-700",
    proposal_sent: "bg-yellow-100 text-yellow-700",
    negotiating: "bg-orange-100 text-orange-700",
    won: "bg-emerald-100 text-emerald-700",
    lost: "bg-red-100 text-red-700",
    unresponsive: "bg-slate-100 text-slate-700",
  };

  const priorityColors = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leads ({filtered.length})</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-sm font-medium text-slate-600">Lead</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Contact</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Interest</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Status</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Priority</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Follow Up</th>
                <th className="text-left p-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{lead.full_name}</div>
                    <div className="text-xs text-slate-500">{lead.country || "N/A"}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs text-green-600 hover:underline flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {lead.phone}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-slate-700">{lead.destination || "Not specified"}</div>
                    <div className="text-xs text-slate-500">
                      {lead.interested_in?.join(", ") || "General inquiry"}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={statusColors[lead.status] || "bg-slate-100 text-slate-700"}>
                      {lead.status?.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={priorityColors[lead.priority] || "bg-slate-100 text-slate-700"}>
                      {lead.priority}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {lead.follow_up_date ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {moment(lead.follow_up_date).format("MMM D")}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No follow-up</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectLead(lead)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No leads found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}