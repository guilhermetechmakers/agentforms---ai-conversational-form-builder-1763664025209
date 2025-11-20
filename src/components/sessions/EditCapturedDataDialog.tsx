import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface EditCapturedDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  fieldKey: string;
  currentValue: any;
  onSave: (value: any) => void;
}

export function EditCapturedDataDialog({
  open,
  onOpenChange,
  fieldKey,
  currentValue,
  onSave,
}: EditCapturedDataDialogProps) {
  const [value, setValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Format the current value for editing
      if (currentValue === null || currentValue === undefined) {
        setValue("");
      } else if (typeof currentValue === "object") {
        setValue(JSON.stringify(currentValue, null, 2));
      } else {
        setValue(String(currentValue));
      }
    }
  }, [open, currentValue]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Try to parse as JSON if it looks like JSON
      let parsedValue: any = value;
      if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
        try {
          parsedValue = JSON.parse(value);
        } catch {
          // If parsing fails, use as string
          parsedValue = value;
        }
      } else if (value.trim() === "") {
        parsedValue = null;
      }

      onSave(parsedValue);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving value:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Field: {fieldKey}</DialogTitle>
          <DialogDescription>
            Update the value for this captured field. You can enter text, numbers, or JSON objects.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="field-value">Value</Label>
            <textarea
              id="field-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex min-h-[200px] w-full rounded-lg border border-pale-gray bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-medium-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 font-mono"
              placeholder="Enter value..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
