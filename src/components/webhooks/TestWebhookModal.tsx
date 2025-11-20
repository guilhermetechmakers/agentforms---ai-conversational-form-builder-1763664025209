import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebhookTestResult } from "@/types/webhook";

interface TestWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTest: (samplePayload?: Record<string, any>) => Promise<WebhookTestResult>;
  isLoading?: boolean;
}

export function TestWebhookModal({
  open,
  onOpenChange,
  onTest,
  isLoading = false,
}: TestWebhookModalProps) {
  const [testResult, setTestResult] = useState<WebhookTestResult | null>(null);
  const [customPayload, setCustomPayload] = useState("");
  const [useCustomPayload, setUseCustomPayload] = useState(false);

  const defaultPayload = {
    session_id: "test-session-123",
    agent_id: "test-agent-456",
    status: "completed",
    collected_fields: {
      name: "John Doe",
      email: "john@example.com",
      message: "This is a test webhook payload",
    },
    completed_at: new Date().toISOString(),
    timestamp: new Date().toISOString(),
  };

  const handleTest = async () => {
    setTestResult(null);
    try {
      const payload = useCustomPayload && customPayload.trim()
        ? JSON.parse(customPayload)
        : defaultPayload;
      const result = await onTest(payload);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error_message: error instanceof Error ? error.message : "Invalid JSON payload",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleClose = () => {
    setTestResult(null);
    setCustomPayload("");
    setUseCustomPayload(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Webhook Delivery</DialogTitle>
          <DialogDescription>
            Send a test payload to verify your webhook configuration is working correctly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payload Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="use-custom"
                checked={useCustomPayload}
                onChange={(e) => setUseCustomPayload(e.target.checked)}
                className="rounded border-pale-gray"
              />
              <Label htmlFor="use-custom" className="font-normal cursor-pointer">
                Use custom payload
              </Label>
            </div>

            {useCustomPayload ? (
              <div className="space-y-2">
                <Label htmlFor="custom-payload">Custom JSON Payload</Label>
                <Textarea
                  id="custom-payload"
                  value={customPayload}
                  onChange={(e) => setCustomPayload(e.target.value)}
                  placeholder={JSON.stringify(defaultPayload, null, 2)}
                  className="font-mono text-sm min-h-[200px]"
                />
                <p className="text-xs text-medium-gray">
                  Enter a valid JSON object to use as the test payload.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Default Test Payload</Label>
                <div className="bg-pale-gray rounded-lg p-3">
                  <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono overflow-x-auto">
                    {JSON.stringify(defaultPayload, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={cn(
                "rounded-lg p-4 border-2 animate-fade-in-up",
                testResult.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              )}
            >
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        "font-semibold",
                        testResult.success ? "text-green-800" : "text-red-800"
                      )}
                    >
                      {testResult.success ? "Test Successful" : "Test Failed"}
                    </h4>
                    {testResult.status_code && (
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          testResult.status_code >= 200 && testResult.status_code < 300
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        )}
                      >
                        HTTP {testResult.status_code}
                      </span>
                    )}
                    {testResult.response_time_ms && (
                      <span className="text-xs text-medium-gray">
                        ({testResult.response_time_ms}ms)
                      </span>
                    )}
                  </div>

                  {testResult.response_body && (
                    <div>
                      <Label className="text-xs text-foreground">Response Body</Label>
                      <div className="bg-white rounded p-2 mt-1">
                        <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono overflow-x-auto">
                          {testResult.response_body}
                        </pre>
                      </div>
                    </div>
                  )}

                  {testResult.error_message && (
                    <div>
                      <Label className="text-xs text-red-800">Error Message</Label>
                      <p className="text-sm text-red-700 mt-1">{testResult.error_message}</p>
                    </div>
                  )}

                  <p className="text-xs text-medium-gray">
                    Tested at: {new Date(testResult.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!testResult && (
            <div className="flex items-center justify-center py-8 text-medium-gray">
              <AlertCircle className="h-8 w-8 mr-2" />
              <p>Click "Send Test" to verify your webhook configuration.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Close
          </Button>
          <Button
            onClick={handleTest}
            disabled={isLoading || (useCustomPayload && !customPayload.trim())}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Send Test"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
