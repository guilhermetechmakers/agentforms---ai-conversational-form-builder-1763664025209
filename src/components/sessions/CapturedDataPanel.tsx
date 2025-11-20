import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle2, XCircle } from "lucide-react";
import { useUpdateCapturedData } from "@/hooks/useSessions";
import { EditCapturedDataDialog } from "./EditCapturedDataDialog";
import { cn } from "@/lib/utils";

interface CapturedDataPanelProps {
  sessionId: string;
  capturedData: Record<string, any>;
}

export function CapturedDataPanel({
  sessionId,
  capturedData,
}: CapturedDataPanelProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const updateCapturedData = useUpdateCapturedData();

  const fields = Object.entries(capturedData || {});

  if (fields.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-medium-gray mb-4" />
        <h3 className="text-lg font-semibold text-charcoal mb-2">
          No data captured yet
        </h3>
        <p className="text-medium-gray">
          This session hasn't collected any field data yet.
        </p>
      </div>
    );
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getValueType = (value: any): string => {
    if (value === null || value === undefined) return "empty";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "object") return "object";
    if (typeof value === "string") {
      if (value.includes("@")) return "email";
      if (/^\d{10,}$/.test(value)) return "phone";
      if (!isNaN(Date.parse(value))) return "date";
    }
    return "text";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal">
            Captured Fields
          </h3>
          <p className="text-sm text-medium-gray">
            {fields.length} field{fields.length !== 1 ? "s" : ""} collected
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {fields.map(([key, value], index) => {
          const valueType = getValueType(value);
          const hasValue = value !== null && value !== undefined && value !== "";

          return (
            <Card
              key={key}
              className={cn(
                "animate-fade-in-up transition-all hover:shadow-card-hover",
                !hasValue && "opacity-60"
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base font-medium text-charcoal mb-1">
                      {key}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          valueType === "email"
                            ? "bg-light-blue/20 text-light-blue"
                            : valueType === "phone"
                            ? "bg-light-orange/20 text-deep-orange"
                            : valueType === "date"
                            ? "bg-pale-pink/20 text-pale-pink"
                            : valueType === "number"
                            ? "bg-soft-yellow/20 text-charcoal"
                            : "bg-lavender/20 text-charcoal"
                        )}
                      >
                        {valueType}
                      </span>
                      {hasValue ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Valid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-medium-gray">
                          <XCircle className="h-3 w-3" />
                          Empty
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingField(key)}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-pale-gray rounded-lg p-3">
                  <pre className="text-sm text-foreground whitespace-pre-wrap break-words font-sans">
                    {formatValue(value)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {editingField && (
        <EditCapturedDataDialog
          open={!!editingField}
          onOpenChange={(open) => !open && setEditingField(null)}
          sessionId={sessionId}
          fieldKey={editingField}
          currentValue={capturedData[editingField]}
          onSave={(newValue) => {
            updateCapturedData.mutate({
              sessionId,
              data: { ...capturedData, [editingField]: newValue },
            });
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
}
