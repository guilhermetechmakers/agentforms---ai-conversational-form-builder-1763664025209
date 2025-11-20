import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WebhookConfig, CreateWebhookInput, UpdateWebhookInput } from "@/types/webhook";

const webhookSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  method: z.enum(["POST", "PUT", "PATCH"]),
  headers: z.record(z.string()).optional(),
  auth_type: z.enum(["none", "bearer", "basic"]),
  auth_token: z.string().optional(),
  auth_username: z.string().optional(),
  auth_password: z.string().optional(),
  triggers: z.array(z.enum(["on-complete", "per-message"])).min(1, "Select at least one trigger"),
  hmac_secret: z.string().optional(),
  enabled: z.boolean().default(true),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

interface WebhookConfigurationFormProps {
  agentId: string;
  webhook?: WebhookConfig;
  onSubmit: (data: CreateWebhookInput | UpdateWebhookInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function WebhookConfigurationForm({
  agentId,
  webhook,
  onSubmit,
  onCancel,
  isLoading = false,
}: WebhookConfigurationFormProps) {
  const isEditing = !!webhook;
  const [customHeaders, setCustomHeaders] = useState<Array<{ key: string; value: string }>>([]);
  const [headerKey, setHeaderKey] = useState("");
  const [headerValue, setHeaderValue] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: webhook?.url || "",
      method: webhook?.method || "POST",
      auth_type: webhook?.auth_type || "none",
      triggers: webhook?.triggers || ["on-complete"],
      enabled: webhook?.enabled ?? true,
      hmac_secret: webhook?.hmac_secret || "",
    },
  });

  const authType = watch("auth_type");
  const triggers = watch("triggers") || [];

  // Initialize custom headers from webhook
  useEffect(() => {
    if (webhook?.headers) {
      const headerEntries = Object.entries(webhook.headers).map(([key, value]) => ({
        key,
        value,
      }));
      setCustomHeaders(headerEntries);
    }
  }, [webhook]);

  const handleAddHeader = () => {
    if (headerKey.trim() && headerValue.trim()) {
      setCustomHeaders([...customHeaders, { key: headerKey.trim(), value: headerValue.trim() }]);
      setHeaderKey("");
      setHeaderValue("");
    }
  };

  const handleRemoveHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const handleToggleTrigger = (trigger: "on-complete" | "per-message") => {
    const currentTriggers = triggers || [];
    if (currentTriggers.includes(trigger)) {
      setValue(
        "triggers",
        currentTriggers.filter((t) => t !== trigger),
        { shouldValidate: true }
      );
    } else {
      setValue("triggers", [...currentTriggers, trigger], { shouldValidate: true });
    }
  };

  const onFormSubmit = async (data: WebhookFormData) => {
    const headers = customHeaders.reduce(
      (acc, header) => {
        if (header.key && header.value) {
          acc[header.key] = header.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    const webhookData: CreateWebhookInput | UpdateWebhookInput = {
      agent_id: agentId,
      url: data.url,
      method: data.method,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      auth_type: data.auth_type,
      triggers: data.triggers,
      enabled: data.enabled,
      hmac_secret: data.hmac_secret || undefined,
      ...(data.auth_type === "bearer" && data.auth_token
        ? { auth_token: data.auth_token }
        : {}),
      ...(data.auth_type === "basic" && data.auth_username && data.auth_password
        ? { auth_username: data.auth_username, auth_password: data.auth_password }
        : {}),
    };

    await onSubmit(webhookData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Webhook" : "Create Webhook"}</CardTitle>
          <CardDescription>
            Configure webhook settings to automatically forward session data to external systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="url">
              Webhook URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/webhook"
              {...register("url")}
              className={cn(errors.url && "border-red-500")}
            />
            {errors.url && (
              <p className="text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          {/* HTTP Method */}
          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <Select
              value={watch("method")}
              onValueChange={(value) => setValue("method", value as "POST" | "PUT" | "PATCH")}
            >
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Headers */}
          <div className="space-y-2">
            <Label>Custom Headers</Label>
            <div className="space-y-2">
              {customHeaders.map((header, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={header.key}
                    placeholder="Header name"
                    disabled
                    className="flex-1"
                  />
                  <Input
                    value={header.value}
                    placeholder="Header value"
                    disabled
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveHeader(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                  placeholder="Header name"
                  className="flex-1"
                />
                <Input
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                  placeholder="Header value"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddHeader}
                  disabled={!headerKey.trim() || !headerValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <Label>Authentication</Label>
            <Select
              value={authType}
              onValueChange={(value) => setValue("auth_type", value as "none" | "bearer" | "basic")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
              </SelectContent>
            </Select>

            {authType === "bearer" && (
              <div className="space-y-2">
                <Label htmlFor="auth_token">Bearer Token</Label>
                <Input
                  id="auth_token"
                  type="password"
                  placeholder="Enter bearer token"
                  {...register("auth_token")}
                />
              </div>
            )}

            {authType === "basic" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth_username">Username</Label>
                  <Input
                    id="auth_username"
                    placeholder="Enter username"
                    {...register("auth_username")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth_password">Password</Label>
                  <Input
                    id="auth_password"
                    type="password"
                    placeholder="Enter password"
                    {...register("auth_password")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Event Triggers */}
          <div className="space-y-2">
            <Label>
              Event Triggers <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trigger-on-complete"
                  checked={triggers.includes("on-complete")}
                  onCheckedChange={() => handleToggleTrigger("on-complete")}
                />
                <Label
                  htmlFor="trigger-on-complete"
                  className="font-normal cursor-pointer"
                >
                  On Session Complete
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trigger-per-message"
                  checked={triggers.includes("per-message")}
                  onCheckedChange={() => handleToggleTrigger("per-message")}
                />
                <Label
                  htmlFor="trigger-per-message"
                  className="font-normal cursor-pointer"
                >
                  Per Message
                </Label>
              </div>
            </div>
            {errors.triggers && (
              <p className="text-sm text-red-600">{errors.triggers.message}</p>
            )}
          </div>

          {/* HMAC Secret */}
          <div className="space-y-2">
            <Label htmlFor="hmac_secret">HMAC Secret (Optional)</Label>
            <Input
              id="hmac_secret"
              type="password"
              placeholder="Enter HMAC secret for signature verification"
              {...register("hmac_secret")}
            />
            <p className="text-xs text-medium-gray">
              If provided, webhook payloads will be signed with HMAC-SHA256.
            </p>
          </div>

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enable Webhook</Label>
              <p className="text-sm text-medium-gray">
                When enabled, webhooks will be sent according to the configured triggers.
              </p>
            </div>
            <Switch
              id="enabled"
              checked={watch("enabled")}
              onCheckedChange={(checked) => setValue("enabled", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEditing ? "Update Webhook" : "Create Webhook"
          )}
        </Button>
      </div>
    </form>
  );
}
