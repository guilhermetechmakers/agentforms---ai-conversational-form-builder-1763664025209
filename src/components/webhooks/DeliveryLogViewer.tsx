import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryLog } from "@/types/webhook";

interface DeliveryLogViewerProps {
  logs: DeliveryLog[];
  isLoading?: boolean;
  onRetry?: (logId: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DeliveryLogViewer({
  logs,
  isLoading = false,
  onRetry,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  onPageChange,
}: DeliveryLogViewerProps) {
  const getStatusIcon = (status: DeliveryLog["status"]) => {
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

  const getStatusColor = (status: DeliveryLog["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "retrying":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-medium-gray mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">No delivery logs</h3>
        <p className="text-medium-gray">
          No webhook delivery attempts have been recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onStatusFilterChange && (
            <Select value={statusFilter || "all"} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="retrying">Retrying</SelectItem>
              </SelectContent>
            </Select>
          )}
          <p className="text-sm text-medium-gray">
            {logs.length} log{logs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {logs.map((log, index) => (
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
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <CardTitle className="text-base font-medium text-charcoal">
                      Delivery Attempt
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        getStatusColor(log.status)
                      )}
                    >
                      {getStatusIcon(log.status)}
                      {log.status}
                    </Badge>
                    {log.status_code && (
                      <span className="text-xs text-medium-gray">
                        HTTP {log.status_code}
                      </span>
                    )}
                    {log.retry_count > 0 && (
                      <span className="text-xs text-medium-gray">
                        Retries: {log.retry_count}
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
                    {log.next_retry_at && (
                      <>
                        <span>•</span>
                        <span>
                          Next retry: {format(new Date(log.next_retry_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {log.status === "failed" && onRetry && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onRetry(log.id)}
                    disabled={isLoading}
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
                <h4 className="text-sm font-medium text-charcoal mb-2">Request Payload</h4>
                <div className="bg-pale-gray rounded-lg p-3">
                  <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono overflow-x-auto">
                    {JSON.stringify(log.request_payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Response Body */}
              {log.response_body && (
                <div>
                  <h4 className="text-sm font-medium text-charcoal mb-2">Response Body</h4>
                  <div className="bg-pale-gray rounded-lg p-3">
                    <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono overflow-x-auto">
                      {log.response_body}
                    </pre>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {log.error_message && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Error Message</h4>
                  <p className="text-xs text-red-700">{log.error_message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages !== undefined && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((page || 1) - 1)}
            disabled={!page || page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-medium-gray">
            Page {page || 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange((page || 1) + 1)}
            disabled={!page || page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
