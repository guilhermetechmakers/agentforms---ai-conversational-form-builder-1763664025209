import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { useResendWebhook } from "@/hooks/useSessions";
import { cn } from "@/lib/utils";
import type { WebhookLog } from "@/types/session";

interface WebhookLogPanelProps {
  sessionId: string;
  webhookLogs: WebhookLog[];
}

export function WebhookLogPanel({
  sessionId,
  webhookLogs,
}: WebhookLogPanelProps) {
  const resendWebhook = useResendWebhook();

  const getStatusIcon = (status: WebhookLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "retrying":
        return <RefreshCw className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-medium-gray" />;
    }
  };

  const getStatusColor = (status: WebhookLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "retrying":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (webhookLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-medium-gray mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">
          No webhook logs
        </h3>
        <p className="text-medium-gray">
          This session doesn't have any webhook delivery attempts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">
            Webhook Delivery Log
          </h3>
          <p className="text-sm text-medium-gray">
            {webhookLogs.length} attempt{webhookLogs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {webhookLogs.map((log, index) => (
          <Card
            key={log.id}
            className={cn(
              "animate-fade-in-up transition-all hover:shadow-card-hover",
              log.status === "failed" && "border-red-200"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-base font-medium text-charcoal">
                      {log.webhook_url}
                    </CardTitle>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        getStatusColor(log.status)
                      )}
                    >
                      {getStatusIcon(log.status)}
                      {log.status}
                    </span>
                    {log.status_code && (
                      <span className="text-xs text-medium-gray">
                        HTTP {log.status_code}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-medium-gray">
                    <span>
                      Attempted: {format(new Date(log.attempted_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    {log.completed_at && (
                      <>
                        <span>•</span>
                        <span>
                          Completed: {format(new Date(log.completed_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </>
                    )}
                    {log.retry_count > 0 && (
                      <>
                        <span>•</span>
                        <span>Retries: {log.retry_count}</span>
                      </>
                    )}
                  </div>
                </div>
                {log.status === "failed" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      resendWebhook.mutate({
                        sessionId,
                        webhookLogId: log.id,
                      })
                    }
                    disabled={resendWebhook.isPending}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Request Payload */}
              <div>
                <h4 className="text-sm font-medium text-charcoal mb-2">
                  Request Payload
                </h4>
                <div className="bg-pale-gray rounded-lg p-3">
                  <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-sans overflow-x-auto">
                    {JSON.stringify(log.request_payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Response Body */}
              {log.response_body && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal mb-2">
                    Response Body
                  </h4>
                  <div className="bg-pale-gray rounded-lg p-3">
                    <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-sans overflow-x-auto">
                      {log.response_body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {log.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Error Message
                  </h4>
                  <p className="text-xs text-red-700">{log.error_message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
