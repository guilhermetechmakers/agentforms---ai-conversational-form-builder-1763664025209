import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet } from "lucide-react";

interface ExportSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: "json" | "csv") => void;
}

export function ExportSessionDialog({
  open,
  onOpenChange,
  onExport,
}: ExportSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Session Data</DialogTitle>
          <DialogDescription>
            Choose a format to export this session's data, including messages, captured fields, and metadata.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="h-auto flex-col gap-3 p-6 hover:bg-pale-gray"
            onClick={() => onExport("json")}
          >
            <FileJson className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-medium">JSON</div>
              <div className="text-xs text-medium-gray mt-1">
                Structured data format
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            className="h-auto flex-col gap-3 p-6 hover:bg-pale-gray"
            onClick={() => onExport("csv")}
          >
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div className="text-center">
              <div className="font-medium">CSV</div>
              <div className="text-xs text-medium-gray mt-1">
                Spreadsheet format
              </div>
            </div>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
