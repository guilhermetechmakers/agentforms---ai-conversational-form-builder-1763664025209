import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateSession } from "@/hooks/useSessions";
import { useAgents } from "@/hooks/useAgents";
import type { SessionCreateRequest } from "@/types/session";

const sessionSchema = z.object({
  agent_id: z.string().min(1, "Agent is required"),
  respondent_id: z.string().optional(),
  respondent_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  retention_period_days: z.number().min(1).max(365).optional(),
  action_type: z.enum(["archive", "delete"]).optional(),
  auto_enforce: z.boolean().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface SessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAgentId?: string;
  onSuccess?: (sessionId: string) => void;
}

export function SessionModal({
  open,
  onOpenChange,
  defaultAgentId,
  onSuccess,
}: SessionModalProps) {
  const [includeRetentionPolicy, setIncludeRetentionPolicy] = useState(false);
  const createSession = useCreateSession();
  const { data: agents, isLoading: agentsLoading } = useAgents();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      agent_id: defaultAgentId || "",
      respondent_id: "",
      respondent_email: "",
      retention_period_days: 30,
      action_type: "archive",
      auto_enforce: true,
    },
  });

  const agentId = watch("agent_id");
  const actionType = watch("action_type");

  useEffect(() => {
    if (defaultAgentId) {
      setValue("agent_id", defaultAgentId);
    }
  }, [defaultAgentId, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      setIncludeRetentionPolicy(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: SessionFormData) => {
    try {
      const request: SessionCreateRequest = {
        agent_id: data.agent_id,
        respondent_id: data.respondent_id || undefined,
        respondent_email: data.respondent_email || undefined,
        retention_policy: includeRetentionPolicy
          ? {
              retention_period_days: data.retention_period_days || 30,
              action_type: data.action_type || "archive",
              auto_enforce: data.auto_enforce ?? true,
            }
          : undefined,
      };

      const newSession = await createSession.mutateAsync(request);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess(newSession.id);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Start a new session to collect data from a respondent. Configure retention policies to manage data lifecycle.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent_id">Agent *</Label>
            <Select
              value={agentId}
              onValueChange={(value) => setValue("agent_id", value)}
            >
              <SelectTrigger id="agent_id">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agentsLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : agents && agents.length > 0 ? (
                  agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-sm text-medium-gray">
                    No agents available
                  </div>
                )}
              </SelectContent>
            </Select>
            {errors.agent_id && (
              <p className="text-sm text-deep-orange">{errors.agent_id.message}</p>
            )}
          </div>

          {/* Respondent ID */}
          <div className="space-y-2">
            <Label htmlFor="respondent_id">Respondent ID (optional)</Label>
            <Input
              id="respondent_id"
              placeholder="Enter respondent identifier"
              {...register("respondent_id")}
            />
            {errors.respondent_id && (
              <p className="text-sm text-deep-orange">{errors.respondent_id.message}</p>
            )}
          </div>

          {/* Respondent Email */}
          <div className="space-y-2">
            <Label htmlFor="respondent_email">Respondent Email (optional)</Label>
            <Input
              id="respondent_email"
              type="email"
              placeholder="respondent@example.com"
              {...register("respondent_email")}
            />
            {errors.respondent_email && (
              <p className="text-sm text-deep-orange">{errors.respondent_email.message}</p>
            )}
          </div>

          {/* Retention Policy Toggle */}
          <div className="flex items-center justify-between p-4 bg-pale-gray rounded-lg">
            <div>
              <Label htmlFor="include-retention" className="text-base font-medium">
                Configure Retention Policy
              </Label>
              <p className="text-sm text-medium-gray mt-1">
                Set data retention and archival rules for this session
              </p>
            </div>
            <Switch
              id="include-retention"
              checked={includeRetentionPolicy}
              onCheckedChange={setIncludeRetentionPolicy}
            />
          </div>

          {/* Retention Policy Options */}
          {includeRetentionPolicy && (
            <div className="space-y-4 p-4 bg-pale-gray rounded-lg animate-fade-in-up">
              <div className="space-y-2">
                <Label htmlFor="retention_period_days">Retention Period (days)</Label>
                <Input
                  id="retention_period_days"
                  type="number"
                  min="1"
                  max="365"
                  {...register("retention_period_days", { valueAsNumber: true })}
                />
                {errors.retention_period_days && (
                  <p className="text-sm text-deep-orange">
                    {errors.retention_period_days.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_type">Action Type</Label>
                <Select
                  value={actionType}
                  onValueChange={(value: "archive" | "delete") =>
                    setValue("action_type", value)
                  }
                >
                  <SelectTrigger id="action_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="archive">Archive</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto_enforce">Auto-enforce</Label>
                  <p className="text-xs text-medium-gray mt-1">
                    Automatically apply retention policy
                  </p>
                </div>
                <Switch
                  id="auto_enforce"
                  checked={watch("auto_enforce")}
                  onCheckedChange={(checked) => setValue("auto_enforce", checked)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={createSession.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
