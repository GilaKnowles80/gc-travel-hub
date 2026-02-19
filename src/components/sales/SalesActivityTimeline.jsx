import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar, FileText, MessageCircle, TrendingUp } from "lucide-react";
import moment from "moment";

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  proposal: FileText,
  follow_up: MessageCircle,
  note: MessageCircle,
  status_change: TrendingUp,
};

const outcomeColors = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-slate-100 text-slate-700",
  negative: "bg-red-100 text-red-700",
  no_response: "bg-orange-100 text-orange-700",
};

export default function SalesActivityTimeline({ activities }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.activity_type] || MessageCircle;
            return (
              <div key={activity.id} className="flex gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">{activity.subject || activity.activity_type}</h4>
                    <span className="text-xs text-slate-500">
                      {moment(activity.created_date).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type}
                    </Badge>
                    {activity.outcome && (
                      <Badge className={outcomeColors[activity.outcome] || "bg-slate-100 text-slate-700"}>
                        {activity.outcome}
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">by {activity.sales_person}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No activities yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}