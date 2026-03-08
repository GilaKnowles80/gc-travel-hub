import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Bell, BellOff, TrendingDown, TrendingUp, AlertTriangle, 
    XCircle, MapPin, Tag, Clock, Mail, Smartphone, Settings,
    Loader2, CheckCircle2, Info
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function TravelAlerts() {
    const [user, setUser] = useState(null);
    const queryClient = useQueryClient();

    React.useEffect(() => {
        base44.auth.me().then(setUser).catch(() => setUser(null));
    }, []);

    // Fetch preferences
    const { data: preferences, isLoading: prefsLoading } = useQuery({
        queryKey: ['alertPreferences', user?.email],
        queryFn: async () => {
            const prefs = await base44.entities.TravelAlertPreference.filter({
                user_email: user.email
            });
            return prefs.length > 0 ? prefs[0] : null;
        },
        enabled: !!user
    });

    // Fetch alerts
    const { data: alerts = [], isLoading: alertsLoading } = useQuery({
        queryKey: ['travelAlerts', user?.email],
        queryFn: () => base44.entities.TravelAlert.filter(
            { user_email: user.email },
            '-created_date',
            50
        ),
        enabled: !!user,
        refetchInterval: 30000
    });

    // Update preferences mutation
    const updatePrefsMutation = useMutation({
        mutationFn: async (updates) => {
            if (preferences) {
                return base44.entities.TravelAlertPreference.update(preferences.id, updates);
            } else {
                return base44.entities.TravelAlertPreference.create({
                    user_email: user.email,
                    ...updates
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['alertPreferences']);
            toast.success('Alert preferences updated');
        }
    });

    // Mark alert as read
    const markReadMutation = useMutation({
        mutationFn: (alertId) => base44.entities.TravelAlert.update(alertId, { is_read: true }),
        onSuccess: () => queryClient.invalidateQueries(['travelAlerts'])
    });

    // Delete alert
    const deleteAlertMutation = useMutation({
        mutationFn: (alertId) => base44.entities.TravelAlert.delete(alertId),
        onSuccess: () => {
            queryClient.invalidateQueries(['travelAlerts']);
            toast.success('Alert deleted');
        }
    });

    const handleToggleAlertType = (type, value) => {
        updatePrefsMutation.mutate({
            alert_types: {
                ...preferences?.alert_types,
                [type]: value
            }
        });
    };

    const handleToggleChannel = (channel, value) => {
        updatePrefsMutation.mutate({
            notification_channels: {
                ...preferences?.notification_channels,
                [channel]: value
            }
        });
    };

    const handleToggleMaster = (value) => {
        updatePrefsMutation.mutate({ is_active: value });
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'price_drop': return <TrendingDown className="w-5 h-5 text-green-600" />;
            case 'price_increase': return <TrendingUp className="w-5 h-5 text-orange-600" />;
            case 'flight_delay': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'flight_cancellation': return <XCircle className="w-5 h-5 text-red-600" />;
            case 'gate_change': return <MapPin className="w-5 h-5 text-blue-600" />;
            case 'last_minute_deal':
            case 'destination_deal': return <Tag className="w-5 h-5 text-purple-600" />;
            default: return <Info className="w-5 h-5 text-slate-600" />;
        }
    };

    const getSeverityBadge = (severity) => {
        const colors = {
            info: 'bg-blue-100 text-blue-800',
            warning: 'bg-yellow-100 text-yellow-800',
            urgent: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800'
        };
        return <Badge className={colors[severity] || colors.info}>{severity}</Badge>;
    };

    const unreadAlerts = alerts.filter(a => !a.is_read);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-slate-600">Please log in to manage travel alerts</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (prefsLoading || alertsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="w-8 h-8 text-amber-600" />
                                <h1 className="text-3xl font-bold text-slate-900">Travel Alerts</h1>
                            </div>
                            <p className="text-slate-600">
                                Stay informed about flight changes, price drops, and personalized deals
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {unreadAlerts.length > 0 && (
                                <Badge className="bg-amber-600 text-white text-lg px-3 py-1">
                                    {unreadAlerts.length} New
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="alerts" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="alerts">
                            <Bell className="w-4 h-4 mr-2" />
                            My Alerts
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="alerts" className="space-y-4">
                        {alerts.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <BellOff className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                        No alerts yet
                                    </h3>
                                    <p className="text-slate-500">
                                        We'll notify you about price changes, flight updates, and great deals
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            alerts.map((alert) => (
                                <Card 
                                    key={alert.id}
                                    className={`${!alert.is_read ? 'border-2 border-amber-200 bg-amber-50/30' : ''}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {getAlertIcon(alert.alert_type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 mb-1">
                                                            {alert.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            {getSeverityBadge(alert.severity)}
                                                            <span className="text-xs text-slate-500">
                                                                {moment(alert.created_date).fromNow()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteAlertMutation.mutate(alert.id)}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-slate-700 mb-3">{alert.message}</p>
                                                {alert.data && (
                                                    <div className="bg-white rounded-lg p-3 mb-3 text-sm">
                                                        {alert.data.old_price && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-slate-500 line-through">
                                                                    ${alert.data.old_price}
                                                                </span>
                                                                <span className="text-green-600 font-semibold">
                                                                    ${alert.data.new_price}
                                                                </span>
                                                                {alert.data.savings && (
                                                                    <Badge className="bg-green-100 text-green-800">
                                                                        Save ${alert.data.savings.toFixed(2)}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    {alert.action_url && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                if (!alert.is_read) {
                                                                    markReadMutation.mutate(alert.id);
                                                                }
                                                                window.location.href = alert.action_url;
                                                            }}
                                                        >
                                                            View Details
                                                        </Button>
                                                    )}
                                                    {!alert.is_read && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => markReadMutation.mutate(alert.id)}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                                            Mark Read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Master Control</CardTitle>
                                        <CardDescription>Enable or disable all travel alerts</CardDescription>
                                    </div>
                                    <Switch
                                        checked={preferences?.is_active ?? true}
                                        onCheckedChange={handleToggleMaster}
                                    />
                                </div>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Alert Types</CardTitle>
                                <CardDescription>Choose which alerts you want to receive</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'price_drops', label: 'Price Drops', icon: TrendingDown, color: 'text-green-600' },
                                    { key: 'price_increases', label: 'Price Increases', icon: TrendingUp, color: 'text-orange-600' },
                                    { key: 'flight_delays', label: 'Flight Delays', icon: Clock, color: 'text-yellow-600' },
                                    { key: 'flight_cancellations', label: 'Flight Cancellations', icon: XCircle, color: 'text-red-600' },
                                    { key: 'gate_changes', label: 'Gate Changes', icon: MapPin, color: 'text-blue-600' },
                                    { key: 'last_minute_deals', label: 'Last-Minute Deals', icon: Tag, color: 'text-purple-600' },
                                    { key: 'destination_deals', label: 'Preferred Destination Deals', icon: Tag, color: 'text-purple-600' }
                                ].map(({ key, label, icon: Icon, color }) => (
                                    <div key={key} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 ${color}`} />
                                            <Label className="cursor-pointer">{label}</Label>
                                        </div>
                                        <Switch
                                            checked={preferences?.alert_types?.[key] ?? true}
                                            onCheckedChange={(val) => handleToggleAlertType(key, val)}
                                            disabled={!preferences?.is_active}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Channels</CardTitle>
                                <CardDescription>How you want to receive alerts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'in_app', label: 'In-App Notifications', icon: Bell },
                                    { key: 'email', label: 'Email Notifications', icon: Mail },
                                    { key: 'sms', label: 'SMS Notifications (Coming Soon)', icon: Smartphone, disabled: true }
                                ].map(({ key, label, icon: Icon, disabled }) => (
                                    <div key={key} className="flex items-center justify-between py-2">
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5 text-slate-600" />
                                            <Label className={disabled ? 'text-slate-400' : 'cursor-pointer'}>
                                                {label}
                                            </Label>
                                        </div>
                                        <Switch
                                            checked={preferences?.notification_channels?.[key] ?? (key === 'in_app')}
                                            onCheckedChange={(val) => handleToggleChannel(key, val)}
                                            disabled={!preferences?.is_active || disabled}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Alert Sensitivity</CardTitle>
                                <CardDescription>Customize when you receive alerts</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label className="mb-3 block">
                                        Minimum Price Drop: {preferences?.price_drop_threshold || 10}%
                                    </Label>
                                    <Slider
                                        value={[preferences?.price_drop_threshold || 10]}
                                        onValueChange={([val]) => updatePrefsMutation.mutate({ price_drop_threshold: val })}
                                        min={5}
                                        max={50}
                                        step={5}
                                        disabled={!preferences?.is_active}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Only notify if price drops by at least this percentage
                                    </p>
                                </div>

                                <div>
                                    <Label className="mb-3 block">
                                        Deal Window: {preferences?.deal_max_days_advance || 30} days
                                    </Label>
                                    <Slider
                                        value={[preferences?.deal_max_days_advance || 30]}
                                        onValueChange={([val]) => updatePrefsMutation.mutate({ deal_max_days_advance: val })}
                                        min={7}
                                        max={90}
                                        step={7}
                                        disabled={!preferences?.is_active}
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        Show deals for trips within this many days
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Quiet Hours</CardTitle>
                                <CardDescription>Pause non-urgent alerts during specific times</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Enable Quiet Hours</Label>
                                    <Switch
                                        checked={preferences?.quiet_hours?.enabled ?? false}
                                        onCheckedChange={(val) => updatePrefsMutation.mutate({
                                            quiet_hours: { ...preferences?.quiet_hours, enabled: val }
                                        })}
                                        disabled={!preferences?.is_active}
                                    />
                                </div>
                                <p className="text-sm text-slate-500">
                                    Currently set: {preferences?.quiet_hours?.start_time || '22:00'} - {preferences?.quiet_hours?.end_time || '08:00'}
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}