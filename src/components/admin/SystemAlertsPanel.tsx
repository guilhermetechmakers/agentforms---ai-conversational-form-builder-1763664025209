import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Filter,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSystemAlerts, useAcknowledgeAlert, useResolveAlert } from '@/hooks/useAdmin';
import type { SystemAlert, AlertFilter } from '@/types/admin';

export function SystemAlertsPanel() {
  const [filter, setFilter] = useState<AlertFilter>({});
  const { data: alerts, isLoading } = useSystemAlerts(filter);
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  const getSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-deep-orange text-white';
      case 'medium':
        return 'bg-soft-yellow text-charcoal';
      case 'low':
        return 'bg-lavender text-charcoal';
      default:
        return 'bg-medium-gray text-white';
    }
  };

  const getStatusColor = (status: SystemAlert['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-700';
      case 'acknowledged':
        return 'bg-light-blue/20 text-light-blue';
      case 'open':
        return 'bg-medium-gray/20 text-medium-gray';
      default:
        return 'bg-medium-gray/20 text-medium-gray';
    }
  };

  const getTypeIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'webhook_failure':
      case 'system_error':
        return <XCircle className="h-5 w-5" />;
      case 'billing_alert':
      case 'usage_limit':
        return <AlertTriangle className="h-5 w-5" />;
      case 'abuse_report':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert.mutateAsync(alertId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert.mutateAsync({ alert_id: alertId });
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-medium-gray" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Monitor system health and critical events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-medium-gray" />
              <Select
                value={filter.status || 'all'}
                onValueChange={(value) =>
                  setFilter({ ...filter, status: value === 'all' ? undefined : value as SystemAlert['status'] })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filter.severity || 'all'}
                onValueChange={(value) =>
                  setFilter({ ...filter, severity: value === 'all' ? undefined : value as SystemAlert['severity'] })
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts List */}
      {alerts && alerts.length > 0 ? (
        <Accordion type="multiple" className="space-y-4">
          {alerts.map((alert) => (
            <AccordionItem
              key={alert.id}
              value={alert.id}
              className="border border-pale-gray rounded-lg px-4"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-charcoal">{alert.title}</h4>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-medium-gray mt-1">
                      {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4 pb-2">
                  <p className="text-sm text-charcoal">{alert.message}</p>
                  {alert.metadata && (
                    <div className="bg-pale-gray/50 rounded-lg p-3">
                      <pre className="text-xs text-charcoal overflow-auto">
                        {JSON.stringify(alert.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {alert.status === 'open' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleAcknowledge(alert.id)}
                          disabled={acknowledgeAlert.isPending}
                        >
                          {acknowledgeAlert.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Clock className="mr-2 h-4 w-4" />
                          )}
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveAlert.isPending}
                        >
                          {resolveAlert.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolveAlert.isPending}
                      >
                        {resolveAlert.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Resolve
                      </Button>
                    )}
                    {alert.status === 'resolved' && (
                      <div className="text-sm text-medium-gray">
                        Resolved on {alert.resolved_at && format(new Date(alert.resolved_at), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-charcoal mb-2">
              No alerts
            </h3>
            <p className="text-medium-gray">
              All systems are operating normally
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
