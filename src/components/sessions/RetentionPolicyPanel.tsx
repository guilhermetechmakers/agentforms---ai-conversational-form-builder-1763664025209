import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Trash2,
  Archive,
  Settings,
  Loader2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  useSessionRetentionPolicy,
  useUpdateRetentionPolicy,
} from "@/hooks/useSessions";

interface RetentionPolicyPanelProps {
  sessionId: string;
}

export function RetentionPolicyPanel({ sessionId }: RetentionPolicyPanelProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(30);
  const [actionType, setActionType] = useState<"archive" | "delete">("archive");
  const [autoEnforce, setAutoEnforce] = useState(true);

  const { data: policy, isLoading } = useSessionRetentionPolicy(sessionId);
  const updatePolicy = useUpdateRetentionPolicy();

  const handleSave = async () => {
    await updatePolicy.mutateAsync({
      sessionId,
      policy: {
        retention_period_days: retentionDays,
        action_type: actionType,
        auto_enforce: autoEnforce,
      },
    });
    setEditDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!policy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Retention Policy</CardTitle>
          <CardDescription>
            No retention policy configured for this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Retention Policy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Retention Policy</DialogTitle>
                <DialogDescription>
                  Set how long to retain this session's data before archiving or deleting it.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    min="1"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select
                    value={actionType}
                    onValueChange={(value: "archive" | "delete") => setActionType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="archive">Archive</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-enforce">Auto-enforce</Label>
                  <Switch
                    id="auto-enforce"
                    checked={autoEnforce}
                    onCheckedChange={setAutoEnforce}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updatePolicy.isPending}>
                  {updatePolicy.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Policy"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  const expirationDate = policy.created_at
    ? new Date(
        new Date(policy.created_at).getTime() +
          policy.retention_period_days * 24 * 60 * 60 * 1000
      )
    : null;

  return (
    <Card className="animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Retention Policy</CardTitle>
            <CardDescription>
              Data retention and archival settings for this session
            </CardDescription>
          </div>
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Retention Policy</DialogTitle>
                <DialogDescription>
                  Update the retention policy for this session.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="retention-days-edit">Retention Period (days)</Label>
                  <Input
                    id="retention-days-edit"
                    type="number"
                    min="1"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-type-edit">Action Type</Label>
                  <Select
                    value={actionType}
                    onValueChange={(value: "archive" | "delete") => setActionType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="archive">Archive</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-enforce-edit">Auto-enforce</Label>
                  <Switch
                    id="auto-enforce-edit"
                    checked={autoEnforce}
                    onCheckedChange={setAutoEnforce}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updatePolicy.isPending}>
                  {updatePolicy.isPending ? (
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Retention Period */}
          <div className="flex items-center justify-between p-3 bg-pale-gray rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-medium-gray" />
              <div>
                <div className="text-sm font-medium text-charcoal">
                  Retention Period
                </div>
                <div className="text-xs text-medium-gray">
                  {policy.retention_period_days} day{policy.retention_period_days !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>

          {/* Action Type */}
          <div className="flex items-center justify-between p-3 bg-pale-gray rounded-lg">
            <div className="flex items-center gap-3">
              {policy.action_type === "archive" ? (
                <Archive className="h-5 w-5 text-light-blue" />
              ) : (
                <Trash2 className="h-5 w-5 text-deep-orange" />
              )}
              <div>
                <div className="text-sm font-medium text-charcoal">
                  Action Type
                </div>
                <div className="text-xs text-medium-gray capitalize">
                  {policy.action_type}
                </div>
              </div>
            </div>
          </div>

          {/* Auto-enforce */}
          <div className="flex items-center justify-between p-3 bg-pale-gray rounded-lg">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-medium-gray" />
              <div>
                <div className="text-sm font-medium text-charcoal">
                  Auto-enforce
                </div>
                <div className="text-xs text-medium-gray">
                  {policy.auto_enforce ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "px-2 py-1 rounded text-xs font-medium",
                policy.auto_enforce
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              )}
            >
              {policy.auto_enforce ? "ON" : "OFF"}
            </div>
          </div>

          {/* Expiration Date */}
          {expirationDate && (
            <div className="flex items-center justify-between p-3 bg-pale-gray rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-medium-gray" />
                <div>
                  <div className="text-sm font-medium text-charcoal">
                    Expiration Date
                  </div>
                  <div className="text-xs text-medium-gray">
                    {format(expirationDate, "MMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policy Created */}
          <div className="pt-2 border-t border-pale-gray">
            <div className="text-xs text-medium-gray">
              Policy created: {format(new Date(policy.created_at), "MMM d, yyyy")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
