import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreateAgent } from "@/hooks/useAgents";
import { Loader2 } from "lucide-react";

const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Agent name must be less than 100 characters"),
});

type CreateAgentFormData = z.infer<typeof createAgentSchema>;

interface CreateAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAgentModal({ open, onOpenChange }: CreateAgentModalProps) {
  const navigate = useNavigate();
  const createAgent = useCreateAgent();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
  });

  const onSubmit = async (data: CreateAgentFormData) => {
    try {
      const newAgent = await createAgent.mutateAsync({
        name: data.name,
        schema: [],
        persona: {
          system_prompt: "",
          tone: "friendly",
        },
        appearance: {
          primary_color: "#7B8CFF",
          welcome_message: "",
        },
        advanced: {
          publish_settings: {
            slug: "",
            password_protected: false,
            captcha_enabled: false,
          },
        },
      });
      
      reset();
      onOpenChange(false);
      navigate(`/dashboard/agents/${newAgent.id}`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Create a new AI conversational form agent. You can configure all settings after creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Support Bot"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={createAgent.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAgent.isPending}>
              {createAgent.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Agent
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
