import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrentUser, useChangePassword, useToggle2FA } from "@/hooks/useAuth";
import {
  useWorkspace,
  useUpdateWorkspace,
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMemberRole,
  useRemoveTeamMember,
  useSubscription,
  useUsageMetrics,
  useInvoices,
  usePaymentMethods,
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useConnectedApps,
  useSecuritySessions,
  useRevokeSession,
  useRevokeAllSessions,
  useAllowedIPs,
  useAddAllowedIP,
  useRemoveAllowedIP,
  useUpdateAccount,
} from "@/hooks/useSettings";
import type { TeamMember } from "@/types/settings";
import {
  User,
  Building2,
  Users,
  CreditCard,
  Key,
  Shield,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Download,
  Loader2,
  Lock,
  Globe,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";

// Validation schemas
const accountSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
});

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
  session_retention_days: z.number().min(1).max(365),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const apiKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
  expires_in_days: z.number().optional(),
});

const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Invalid URL"),
  method: z.enum(["POST", "PUT", "PATCH"]),
  auth_type: z.enum(["none", "bearer", "basic"]),
  auth_token: z.string().optional(),
  triggers: z.array(z.enum(["on-complete", "per-message"])).min(1, "Select at least one trigger"),
});

const allowedIPSchema = z.object({
  ip_address: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address"),
  description: z.string().optional(),
});

type AccountForm = z.infer<typeof accountSchema>;
type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;
type WorkspaceForm = z.infer<typeof workspaceSchema>;
type InviteMemberForm = z.infer<typeof inviteMemberSchema>;
type ApiKeyForm = z.infer<typeof apiKeySchema>;
type WebhookForm = z.infer<typeof webhookSchema>;
type AllowedIPForm = z.infer<typeof allowedIPSchema>;

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showDeleteApiKeyDialog, setShowDeleteApiKeyDialog] = useState(false);
  const [showDeleteWebhookDialog, setShowDeleteWebhookDialog] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null);
  const [webhookToDelete, setWebhookToDelete] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showApiKeySuccess, setShowApiKeySuccess] = useState(false);

  // Data hooks
  const { data: user } = useCurrentUser();
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace();
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useUsageMetrics();
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods();
  const { data: apiKeys, isLoading: apiKeysLoading } = useApiKeys();
  const { data: webhooks, isLoading: webhooksLoading } = useWebhooks();
  const { data: connectedApps, isLoading: appsLoading } = useConnectedApps();
  const { data: sessions, isLoading: sessionsLoading } = useSecuritySessions();
  const { data: allowedIPs, isLoading: allowedIPsLoading } = useAllowedIPs();

  // Mutation hooks
  const updateAccount = useUpdateAccount();
  const changePassword = useChangePassword();
  const toggle2FA = useToggle2FA();
  const updateWorkspace = useUpdateWorkspace();
  const inviteMember = useInviteTeamMember();
  const updateRole = useUpdateTeamMemberRole();
  const removeMember = useRemoveTeamMember();
  const createApiKey = useCreateApiKey();
  const deleteApiKey = useDeleteApiKey();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();
  const addAllowedIP = useAddAllowedIP();
  const removeAllowedIP = useRemoveAllowedIP();

  // Forms
  const accountForm = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      email: user?.email || "",
    },
  });

  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const workspaceForm = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace?.name || "",
      session_retention_days: workspace?.session_retention_days || 90,
    },
  });

  const inviteForm = useForm<InviteMemberForm>({
    resolver: zodResolver(inviteMemberSchema),
  });

  const apiKeyForm = useForm<ApiKeyForm>({
    resolver: zodResolver(apiKeySchema),
  });

  const webhookForm = useForm<WebhookForm>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      method: "POST",
      auth_type: "none",
      triggers: ["on-complete"],
    },
  });

  const allowedIPForm = useForm<AllowedIPForm>({
    resolver: zodResolver(allowedIPSchema),
  });

  // Handlers
  const onAccountSubmit = (data: AccountForm) => {
    updateAccount.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordChangeForm) => {
    changePassword.mutate(
      {
        currentPassword: data.current_password,
        newPassword: data.new_password,
      },
      {
        onSuccess: () => {
          setShowPasswordDialog(false);
          passwordForm.reset();
        },
      }
    );
  };

  const onWorkspaceSubmit = (data: WorkspaceForm) => {
    updateWorkspace.mutate(data);
  };

  const onInviteSubmit = (data: InviteMemberForm) => {
    inviteMember.mutate(data, {
      onSuccess: () => {
        setShowInviteDialog(false);
        inviteForm.reset();
      },
    });
  };

  const onApiKeySubmit = (data: ApiKeyForm) => {
    createApiKey.mutate(data, {
      onSuccess: (response) => {
        setNewApiKey(response.key);
        setShowApiKeySuccess(true);
        setShowApiKeyDialog(false);
        apiKeyForm.reset();
      },
    });
  };

  const onWebhookSubmit = (data: WebhookForm) => {
    createWebhook.mutate(data, {
      onSuccess: () => {
        setShowWebhookDialog(false);
        webhookForm.reset();
      },
    });
  };

  const onAddAllowedIP = (data: AllowedIPForm) => {
    addAllowedIP.mutate(data, {
      onSuccess: () => {
        allowedIPForm.reset();
      },
    });
  };

  const handleDeleteApiKey = () => {
    if (apiKeyToDelete) {
      deleteApiKey.mutate(apiKeyToDelete, {
        onSuccess: () => {
          setShowDeleteApiKeyDialog(false);
          setApiKeyToDelete(null);
        },
      });
    }
  };

  const handleDeleteWebhook = () => {
    if (webhookToDelete) {
      deleteWebhook.mutate(webhookToDelete, {
        onSuccess: () => {
          setShowDeleteWebhookDialog(false);
          setWebhookToDelete(null);
        },
      });
    }
  };

  // Update form defaults when data loads
  if (user && accountForm.getValues("full_name") !== user.full_name) {
    accountForm.reset({
      full_name: user.full_name || "",
      email: user.email || "",
    });
  }

  if (workspace && workspaceForm.getValues("name") !== workspace.name) {
    workspaceForm.reset({
      name: workspace.name,
      session_retention_days: workspace.session_retention_days,
    });
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Settings & Preferences</h1>
        <p className="text-medium-gray mt-1">
          Manage your account, workspace, billing, and security settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 h-auto p-1 bg-pale-gray rounded-lg">
          <TabsTrigger value="account" className="data-[state=active]:bg-white">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="workspace" className="data-[state=active]:bg-white">
            <Building2 className="h-4 w-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-white">
            <Users className="h-4 w-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-white">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-white">
            <Key className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    {...accountForm.register("full_name")}
                    placeholder="John Doe"
                  />
                  {accountForm.formState.errors.full_name && (
                    <p className="text-sm text-deep-orange">
                      {accountForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...accountForm.register("email")}
                    placeholder="name@example.com"
                    disabled
                  />
                  <p className="text-xs text-medium-gray">
                    Email cannot be changed. Contact support if you need to update it.
                  </p>
                </div>

                <Button type="submit" disabled={updateAccount.isPending}>
                  {updateAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowPasswordDialog(true)} variant="secondary">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-medium-gray">
                    Require a verification code in addition to your password
                  </p>
                </div>
                <Switch
                  checked={user?.two_factor_enabled || false}
                  onCheckedChange={(checked) => toggle2FA.mutate(checked)}
                  disabled={toggle2FA.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workspace Tab */}
        <TabsContent value="workspace" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Settings</CardTitle>
              <CardDescription>
                Configure your workspace name and default settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workspaceLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : (
                <form onSubmit={workspaceForm.handleSubmit(onWorkspaceSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      {...workspaceForm.register("name")}
                      placeholder="My Workspace"
                    />
                    {workspaceForm.formState.errors.name && (
                      <p className="text-sm text-deep-orange">
                        {workspaceForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention-days">Session Retention (days)</Label>
                    <Input
                      id="retention-days"
                      type="number"
                      {...workspaceForm.register("session_retention_days", { valueAsNumber: true })}
                      min={1}
                      max={365}
                    />
                    {workspaceForm.formState.errors.session_retention_days && (
                      <p className="text-sm text-deep-orange">
                        {workspaceForm.formState.errors.session_retention_days.message}
                      </p>
                    )}
                    <p className="text-xs text-medium-gray">
                      Sessions older than this will be automatically archived
                    </p>
                  </div>

                  <Button type="submit" disabled={updateWorkspace.isPending}>
                    {updateWorkspace.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team & Roles Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage team members and their roles
                  </CardDescription>
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {teamLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : teamMembers && teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-pale-gray rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.full_name || member.email}</p>
                          <p className="text-sm text-medium-gray">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select
                          value={member.role}
                          onValueChange={(role) =>
                            updateRole.mutate({ memberId: member.id, role: role as TeamMember["role"] })
                          }
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMember.mutate(member.id)}
                          disabled={removeMember.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <p className="text-medium-gray">No team members yet</p>
                  <Button onClick={() => setShowInviteDialog(true)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Your First Member
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {subscriptionLoading || usageLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Your current subscription and usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subscription && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{subscription.plan.name}</span>
                        <span className="text-2xl font-bold">
                          ${subscription.plan.price}/{subscription.plan.interval === "month" ? "mo" : "yr"}
                        </span>
                      </div>
                      <p className="text-sm text-medium-gray mb-4">
                        {subscription.status === "active" ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-deep-orange">{subscription.status}</span>
                        )}
                      </p>
                    </div>
                  )}

                  {usage && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Sessions This Month</Label>
                          <span className="text-sm font-medium">
                            {usage.sessions_this_month} / {usage.sessions_limit}
                          </span>
                        </div>
                        <Progress
                          value={(usage.sessions_this_month / usage.sessions_limit) * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Tokens This Month</Label>
                          <span className="text-sm font-medium">
                            {usage.tokens_this_month.toLocaleString()} / {usage.tokens_limit.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={(usage.tokens_this_month / usage.tokens_limit) * 100}
                          className="h-2"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Storage Used</Label>
                          <span className="text-sm font-medium">
                            {usage.storage_used_gb.toFixed(2)} GB / {usage.storage_limit_gb} GB
                          </span>
                        </div>
                        <Progress
                          value={(usage.storage_used_gb / usage.storage_limit_gb) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethodsLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
                  ) : paymentMethods && paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center justify-between p-4 border border-pale-gray rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <CreditCard className="h-5 w-5 text-medium-gray" />
                            <div>
                              <p className="font-medium">
                                {method.type === "card" && method.brand
                                  ? `${method.brand.toUpperCase()} •••• ${method.last4}`
                                  : `•••• ${method.last4}`}
                              </p>
                              {method.exp_month && method.exp_year && (
                                <p className="text-sm text-medium-gray">
                                  Expires {method.exp_month}/{method.exp_year}
                                </p>
                              )}
                            </div>
                          </div>
                          {method.is_default && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-medium-gray">No payment methods added</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>
                    View and download your invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {invoicesLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
                  ) : invoices && invoices.length > 0 ? (
                    <div className="space-y-4">
                      {invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-4 border border-pale-gray rounded-lg"
                        >
                          <div>
                            <p className="font-medium">Invoice #{invoice.number}</p>
                            <p className="text-sm text-medium-gray">
                              {format(new Date(invoice.created_at), "MMM dd, yyyy")} • ${invoice.amount} {invoice.currency.toUpperCase()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {invoice.status === "paid" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-deep-orange" />
                            )}
                            {invoice.pdf_url && (
                              <Button variant="ghost" size="icon" asChild>
                                <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-medium-gray">No invoices yet</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          {/* API Keys */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for programmatic access
                  </CardDescription>
                </div>
                <Button onClick={() => setShowApiKeyDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {apiKeysLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : apiKeys && apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border border-pale-gray rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <p className="text-sm text-medium-gray">
                          {key.key_prefix}•••••••• • Created {format(new Date(key.created_at), "MMM dd, yyyy")}
                        </p>
                        {key.last_used_at && (
                          <p className="text-xs text-medium-gray">
                            Last used {format(new Date(key.last_used_at), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setApiKeyToDelete(key.id);
                          setShowDeleteApiKeyDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <p className="text-medium-gray mb-4">No API keys created yet</p>
                  <Button onClick={() => setShowApiKeyDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First API Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Webhooks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>
                    Configure webhooks to receive real-time updates
                  </CardDescription>
                </div>
                <Button onClick={() => setShowWebhookDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {webhooksLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : webhooks && webhooks.length > 0 ? (
                <div className="space-y-4">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="p-4 border border-pale-gray rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-sm text-medium-gray">{webhook.url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={webhook.is_active}
                            onCheckedChange={(checked) =>
                              updateWebhook.mutate({
                                webhookId: webhook.id,
                                input: { is_active: checked },
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setWebhookToDelete(webhook.id);
                              setShowDeleteWebhookDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-medium-gray">
                        <span>{webhook.method}</span>
                        <span>•</span>
                        <span>{webhook.triggers.join(", ")}</span>
                        {webhook.last_triggered_at && (
                          <>
                            <span>•</span>
                            <span>Last triggered {format(new Date(webhook.last_triggered_at), "MMM dd, yyyy")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <p className="text-medium-gray mb-4">No webhooks configured yet</p>
                  <Button onClick={() => setShowWebhookDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Webhook
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connected Apps */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Apps</CardTitle>
              <CardDescription>
                Third-party applications connected to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : connectedApps && connectedApps.length > 0 ? (
                <div className="space-y-4">
                  {connectedApps.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 border border-pale-gray rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {app.icon_url ? (
                          <img src={app.icon_url} alt={app.name} className="h-10 w-10 rounded" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                            <SettingsIcon className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-medium-gray">
                            Connected {format(new Date(app.connected_at), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-medium-gray">No connected apps</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Manage your active login sessions
                  </CardDescription>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => revokeAllSessions.mutate()}
                  disabled={revokeAllSessions.isPending}
                >
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-pale-gray rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            {session.device_name || "Unknown Device"}
                          </p>
                          {session.is_current && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-medium-gray">
                          {session.ip_address} • {session.location || "Unknown location"}
                        </p>
                        <p className="text-xs text-medium-gray">
                          Last active {format(new Date(session.last_active), "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeSession.mutate(session.id)}
                          disabled={revokeSession.isPending}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-medium-gray">No active sessions</p>
              )}
            </CardContent>
          </Card>

          {/* Allowed IPs */}
          <Card>
            <CardHeader>
              <CardTitle>Allowed IP Addresses</CardTitle>
              <CardDescription>
                Restrict access to specific IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={allowedIPForm.handleSubmit(onAddAllowedIP)} className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="192.168.1.1"
                      {...allowedIPForm.register("ip_address")}
                    />
                    {allowedIPForm.formState.errors.ip_address && (
                      <p className="text-sm text-deep-orange">
                        {allowedIPForm.formState.errors.ip_address.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Description (optional)"
                      {...allowedIPForm.register("description")}
                    />
                  </div>
                  <Button type="submit" disabled={addAllowedIP.isPending}>
                    {addAllowedIP.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add
                  </Button>
                </div>
              </form>

              {allowedIPsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
              ) : allowedIPs && allowedIPs.length > 0 ? (
                <div className="space-y-2">
                  {allowedIPs.map((ip) => (
                    <div
                      key={ip.id}
                      className="flex items-center justify-between p-3 border border-pale-gray rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{ip.ip_address}</p>
                        {ip.description && (
                          <p className="text-sm text-medium-gray">{ip.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAllowedIP.mutate(ip.id)}
                        disabled={removeAllowedIP.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-medium-gray">No IP addresses configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                {...passwordForm.register("current_password")}
              />
              {passwordForm.formState.errors.current_password && (
                <p className="text-sm text-deep-orange">
                  {passwordForm.formState.errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                {...passwordForm.register("new_password")}
              />
              {passwordForm.formState.errors.new_password && (
                <p className="text-sm text-deep-orange">
                  {passwordForm.formState.errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                type="password"
                {...passwordForm.register("confirm_password")}
              />
              {passwordForm.formState.errors.confirm_password && (
                <p className="text-sm text-deep-orange">
                  {passwordForm.formState.errors.confirm_password.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                {...inviteForm.register("email")}
                placeholder="colleague@example.com"
              />
              {inviteForm.formState.errors.email && (
                <p className="text-sm text-deep-orange">
                  {inviteForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteForm.watch("role")}
                onValueChange={(value) => inviteForm.setValue("role", value as InviteMemberForm["role"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              {inviteForm.formState.errors.role && (
                <p className="text-sm text-deep-orange">
                  {inviteForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowInviteDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMember.isPending}>
                {inviteMember.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic access
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key-name">Name</Label>
              <Input
                id="api-key-name"
                {...apiKeyForm.register("name")}
                placeholder="Production API Key"
              />
              {apiKeyForm.formState.errors.name && (
                <p className="text-sm text-deep-orange">
                  {apiKeyForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key-expires">Expires in (days, optional)</Label>
              <Input
                id="api-key-expires"
                type="number"
                {...apiKeyForm.register("expires_in_days", { valueAsNumber: true })}
                placeholder="90"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowApiKeyDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createApiKey.isPending}>
                {createApiKey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* API Key Success Dialog */}
      <Dialog open={showApiKeySuccess} onOpenChange={setShowApiKeySuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy your API key now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-pale-gray rounded-lg">
              <code className="text-sm break-all">{newApiKey}</code>
            </div>
            <Button
              onClick={() => {
                if (newApiKey) {
                  navigator.clipboard.writeText(newApiKey);
                }
              }}
              className="w-full"
            >
              Copy to Clipboard
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowApiKeySuccess(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Webhook Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook to receive real-time updates
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-name">Name</Label>
              <Input
                id="webhook-name"
                {...webhookForm.register("name")}
                placeholder="Production Webhook"
              />
              {webhookForm.formState.errors.name && (
                <p className="text-sm text-deep-orange">
                  {webhookForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL</Label>
              <Input
                id="webhook-url"
                {...webhookForm.register("url")}
                placeholder="https://example.com/webhook"
              />
              {webhookForm.formState.errors.url && (
                <p className="text-sm text-deep-orange">
                  {webhookForm.formState.errors.url.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-method">Method</Label>
                <Select
                  value={webhookForm.watch("method")}
                  onValueChange={(value) => webhookForm.setValue("method", value as WebhookForm["method"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook-auth">Auth Type</Label>
                <Select
                  value={webhookForm.watch("auth_type")}
                  onValueChange={(value) => webhookForm.setValue("auth_type", value as WebhookForm["auth_type"])}
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
              </div>
            </div>

            {webhookForm.watch("auth_type") !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="webhook-token">Auth Token</Label>
                <Input
                  id="webhook-token"
                  type="password"
                  {...webhookForm.register("auth_token")}
                  placeholder="Enter authentication token"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Triggers</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trigger-complete"
                    checked={webhookForm.watch("triggers").includes("on-complete")}
                    onCheckedChange={(checked) => {
                      const triggers = webhookForm.getValues("triggers");
                      if (checked) {
                        webhookForm.setValue("triggers", [...triggers, "on-complete"]);
                      } else {
                        webhookForm.setValue("triggers", triggers.filter((t) => t !== "on-complete"));
                      }
                    }}
                  />
                  <Label htmlFor="trigger-complete" className="font-normal cursor-pointer">
                    On Session Complete
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="trigger-message"
                    checked={webhookForm.watch("triggers").includes("per-message")}
                    onCheckedChange={(checked) => {
                      const triggers = webhookForm.getValues("triggers");
                      if (checked) {
                        webhookForm.setValue("triggers", [...triggers, "per-message"]);
                      } else {
                        webhookForm.setValue("triggers", triggers.filter((t) => t !== "per-message"));
                      }
                    }}
                  />
                  <Label htmlFor="trigger-message" className="font-normal cursor-pointer">
                    Per Message
                  </Label>
                </div>
              </div>
              {webhookForm.formState.errors.triggers && (
                <p className="text-sm text-deep-orange">
                  {webhookForm.formState.errors.triggers.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowWebhookDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createWebhook.isPending}>
                {createWebhook.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete API Key Alert */}
      <AlertDialog open={showDeleteApiKeyDialog} onOpenChange={setShowDeleteApiKeyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApiKey} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Webhook Alert */}
      <AlertDialog open={showDeleteWebhookDialog} onOpenChange={setShowDeleteWebhookDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWebhook} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
