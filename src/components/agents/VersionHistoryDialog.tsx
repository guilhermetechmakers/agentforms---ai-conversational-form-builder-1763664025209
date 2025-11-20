import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";

interface VersionHistory {
  id: string;
  version: number;
  created_at: string;
  created_by: string;
  changes: string;
  schema_snapshot: unknown;
}

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  agentId,
}: VersionHistoryDialogProps) {
  const { data: versions, isLoading } = useQuery({
    queryKey: ["agent-versions", agentId],
    queryFn: async (): Promise<VersionHistory[]> => {
      return api.get<VersionHistory[]>(`/agents/${agentId}/versions`);
    },
    enabled: open && !!agentId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of this agent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : versions && versions.length > 0 ? (
            versions.map((version) => (
              <Card key={version.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Version {version.version}</Badge>
                        <span className="text-xs text-medium-gray">
                          {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal mb-1">
                        {version.changes || "No change description"}
                      </p>
                      <p className="text-xs text-medium-gray">
                        By {version.created_by}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Restore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-medium-gray">
              <p>No version history available</p>
              <p className="text-xs mt-1">
                Versions will appear here as you make changes
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
