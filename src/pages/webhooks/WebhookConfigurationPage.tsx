import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import {
  useWebhooksByAgent,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useDeliveryLogs,
  useRetryDelivery,
} from "@/hooks/useWebhooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  ArrowLeft,
  Plus,
  Trash2,
  TestTube,
  Loader2,
  Settings,
} from "lucide-react";
import { WebhookConfigurationForm } from "@/components/webhooks/WebhookConfigurationForm";
import { TestWebhookModal } from "@/components/webhooks/TestWebhookModal";
import { DeliveryLogViewer } from "@/components/webhooks/DeliveryLogViewer";
import { cn } from "@/lib/utils";
import type { WebhookConfig, CreateWebhookInput, UpdateWebhookInput, WebhookTestResult } from "@/types/webhook";

export function WebhookConfigurationPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("config");
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookConfig | null>(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [webhookToTest, setWebhookToTest] = useState<WebhookConfig | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deliveryLogPage, setDeliveryLogPage] = useState(1);

  const { data: agents } = useAgents();
  const agent = agents?.find((a) => a.id === agentId);
  const { data: webhooks = [], isLoading: webhooksLoading } = useWebhooksByAgent(agentId || "");
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();
  const retryDelivery = useRetryDelivery();

  const selectedWebhook = editingWebhook || webhookToTest;
  const { data: deliveryLogsData, isLoading: logsLoading } = useDeliveryLogs(
    selectedWebhook?.id || "",
    {
      page: deliveryLogPage,
      limit: 10,
      status: statusFilter !== "all" ? statusFilter : undefined,
    }
  );

  const handleCreateWebhook = () => {
    setEditingWebhook(null);
    setActiveTab("config");
  };

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    setActiveTab("config");
  };

  const handleDeleteWebhook = (webhook: WebhookConfig) => {
    setWebhookToDelete(webhook);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!webhookToDelete) return;
    try {
      await deleteWebhook.mutateAsync(webhookToDelete.id);
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTestWebhook = (webhook: WebhookConfig) => {
    setWebhookToTest(webhook);
    setTestModalOpen(true);
  };

  const handleSubmit = async (data: CreateWebhookInput | UpdateWebhookInput) => {
    try {
      if (editingWebhook) {
        await updateWebhook.mutateAsync({
          id: editingWebhook.id,
          updates: data as UpdateWebhookInput,
        });
        setEditingWebhook(null);
      } else {
        await createWebhook.mutateAsync(data as CreateWebhookInput);
      }
      setActiveTab("list");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTest = async (samplePayload?: Record<string, any>): Promise<WebhookTestResult> => {
    if (!webhookToTest) {
      throw new Error("No webhook selected for testing");
    }
    return testWebhook.mutateAsync({ id: webhookToTest.id, payload: samplePayload });
  };

  const handleRetryDelivery = async (logId: string) => {
    try {
      await retryDelivery.mutateAsync(logId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!agentId) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-charcoal mb-2">Agent not specified</h3>
              <p className="text-medium-gray mb-6">
                Please select an agent to configure webhooks.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-pale-gray"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Webhook Configuration</h1>
            <p className="text-medium-gray mt-1">
              {agent ? agent.name : "Configure webhooks for your agent"}
            </p>
          </div>
        </div>
        {!editingWebhook && (
          <Button
            onClick={handleCreateWebhook}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Webhooks</TabsTrigger>
          <TabsTrigger value="config">
            {editingWebhook ? "Edit Webhook" : "New Webhook"}
          </TabsTrigger>
          {selectedWebhook && (
            <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
          )}
        </TabsList>

        {/* Webhooks List */}
        <TabsContent value="list" className="mt-6">
          {webhooksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : webhooks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No webhooks configured
                  </h3>
                  <p className="text-medium-gray mb-6">
                    Create your first webhook to automatically forward session data to external systems.
                  </p>
                  <Button onClick={handleCreateWebhook} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Webhook
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {webhooks.map((webhook, index) => (
                <Card
                  key={webhook.id}
                  className={cn(
                    "animate-fade-in-up transition-all hover:shadow-card-hover",
                    !webhook.enabled && "opacity-60"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{webhook.url}</CardTitle>
                          {!webhook.enabled && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Disabled
                            </span>
                          )}
                        </div>
                        <CardDescription className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm">Method: {webhook.method}</span>
                            <span>•</span>
                            <span className="text-sm">
                              Triggers: {webhook.triggers.join(", ")}
                            </span>
                            <span>•</span>
                            <span className="text-sm">
                              Auth: {webhook.auth_type === "none" ? "None" : webhook.auth_type}
                            </span>
                          </div>
                          <div className="text-xs text-medium-gray">
                            Created: {new Date(webhook.created_at).toLocaleDateString()}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleTestWebhook(webhook)}
                          className="flex items-center gap-2"
                        >
                          <TestTube className="h-4 w-4" />
                          Test
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditWebhook(webhook)}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteWebhook(webhook)}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Configuration Form */}
        <TabsContent value="config" className="mt-6">
          <WebhookConfigurationForm
            agentId={agentId}
            webhook={editingWebhook || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setEditingWebhook(null);
              setActiveTab("list");
            }}
            isLoading={createWebhook.isPending || updateWebhook.isPending}
          />
        </TabsContent>

        {/* Delivery Logs */}
        {selectedWebhook && (
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Delivery Logs</CardTitle>
                    <CardDescription>
                      View delivery attempts for {selectedWebhook.url}
                    </CardDescription>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTestModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Test Webhook
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DeliveryLogViewer
                  logs={deliveryLogsData?.data || []}
                  isLoading={logsLoading}
                  onRetry={handleRetryDelivery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  page={deliveryLogPage}
                  totalPages={Math.ceil((deliveryLogsData?.count || 0) / 10)}
                  onPageChange={setDeliveryLogPage}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
              All delivery logs will be preserved, but no new webhooks will be sent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteWebhook.isPending}
            >
              {deleteWebhook.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Webhook"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Webhook Modal */}
      {webhookToTest && (
        <TestWebhookModal
          open={testModalOpen}
          onOpenChange={setTestModalOpen}
          onTest={handleTest}
          isLoading={testWebhook.isPending}
        />
      )}
    </div>
  );
}
