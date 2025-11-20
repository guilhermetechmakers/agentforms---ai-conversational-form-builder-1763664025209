import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SchemaFieldList } from "@/components/agents/SchemaFieldList";
import { FieldConfigurationDialog } from "@/components/agents/FieldConfigurationDialog";
import { SchemaPreviewPanel } from "@/components/agents/SchemaPreviewPanel";
import { useAgent, useCreateAgent, useUpdateAgent, usePublishAgent } from "@/hooks/useAgents";
import { useAutosave } from "@/hooks/useAutosave";
import { toast } from "sonner";
import { Save, History, ArrowLeft, Loader2, Settings } from "lucide-react";
import { VersionHistoryDialog } from "@/components/agents/VersionHistoryDialog";
import type { SchemaField, UpdateAgentInput } from "@/types/agent";

export function AgentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;
  
  const { data: agent, isLoading } = useAgent(id || "");
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();
  const publishAgent = usePublishAgent();

  const [activeTab, setActiveTab] = useState("schema");
  const [agentName, setAgentName] = useState("");
  const [agentStatus, setAgentStatus] = useState<"draft" | "published" | "archived">("draft");
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<SchemaField | null>(null);
  const [showPreview] = useState(true);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Initialize form data from agent
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name);
      setAgentStatus(agent.status);
      setSchemaFields(agent.schema || []);
    } else if (isNew) {
      setAgentName("");
      setAgentStatus("draft");
      setSchemaFields([]);
    }
  }, [agent, isNew]);

  // Autosave for existing agents
  const autosaveData: Partial<UpdateAgentInput> = {
    name: agentName,
    status: agentStatus,
    schema: schemaFields,
  };

  const { isSaving } = useAutosave({
    agentId: id || "",
    data: autosaveData,
    enabled: !isNew && !!id && !!agent,
    delay: 2000,
    onSave: () => {
      // Silent save - no toast for autosave
    },
    onError: (error) => {
      console.error("Autosave failed:", error);
    },
  });

  const generateFieldId = () => {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddField = () => {
    setEditingField(null);
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (field: SchemaField) => {
    setEditingField(field);
    setIsFieldDialogOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setSchemaFields((prev) => {
      const newFields = prev.filter((f) => f.id !== fieldId);
      // Reorder remaining fields
      return newFields.map((field, index) => ({
        ...field,
        order: index,
      }));
    });
    toast.success("Field deleted");
  };

  const handleFieldSubmit = (fieldData: Omit<SchemaField, "id" | "order">) => {
    if (editingField) {
      // Update existing field
      setSchemaFields((prev) =>
        prev.map((f) =>
          f.id === editingField.id
            ? { ...fieldData, id: editingField.id, order: editingField.order }
            : f
        )
      );
      toast.success("Field updated");
    } else {
      // Add new field
      const newField: SchemaField = {
        ...fieldData,
        id: generateFieldId(),
        order: schemaFields.length,
      };
      setSchemaFields((prev) => [...prev, newField]);
      toast.success("Field added");
    }
    setIsFieldDialogOpen(false);
    setEditingField(null);
  };

  const handleReorderFields = (reorderedFields: SchemaField[]) => {
    setSchemaFields(reorderedFields);
  };

  const handleSave = async () => {
    if (!agentName.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    if (isNew) {
      // Create new agent
      createAgent.mutate(
        {
          name: agentName,
          schema: schemaFields,
        },
        {
          onSuccess: (newAgent) => {
            toast.success("Agent created successfully!");
            navigate(`/dashboard/agents/${newAgent.id}`);
          },
        }
      );
    } else {
      // Update existing agent
      updateAgent.mutate(
        {
          id: id!,
          updates: {
            name: agentName,
            schema: schemaFields,
            status: agentStatus,
          },
        },
        {
          onSuccess: () => {
            toast.success("Agent saved successfully!");
          },
        }
      );
    }
  };

  const handlePublish = async () => {
    if (!id) {
      toast.error("Please save the agent first");
      return;
    }

    if (schemaFields.length === 0) {
      toast.error("Please add at least one field to the schema");
      return;
    }

    publishAgent.mutate(id, {
      onSuccess: () => {
        setAgentStatus("published");
        toast.success("Agent published successfully!");
      },
    });
  };

  const existingKeys = schemaFields
    .filter((f) => !editingField || f.id !== editingField.id)
    .map((f) => f.key);

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-medium-gray">Loading agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">
              {isNew ? "Create Agent" : "Edit Agent"}
            </h1>
            <p className="text-medium-gray mt-1">
              {isNew
                ? "Build your AI conversational form"
                : "Update your agent configuration"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <Badge variant="outline" className="gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {!isNew && (
            <Button
              variant="ghost"
              onClick={() => setIsVersionHistoryOpen(true)}
            >
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={createAgent.isPending || updateAgent.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isNew ? "Create" : "Save"}
          </Button>
          {!isNew && (
            <Button
              onClick={handlePublish}
              disabled={publishAgent.isPending || agentStatus === "published"}
            >
              {agentStatus === "published" ? "Published" : "Publish"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Information</CardTitle>
              <CardDescription>
                Basic details about your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="My Conversational Form"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Status</Label>
                  <p className="text-sm text-medium-gray">
                    Current status: {agentStatus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="status-toggle">Published</Label>
                  <Switch
                    id="status-toggle"
                    checked={agentStatus === "published"}
                    onCheckedChange={(checked) =>
                      setAgentStatus(checked ? "published" : "draft")
                    }
                    disabled={isNew}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schema Builder Tab */}
          <Card>
            <CardHeader>
              <CardTitle>Schema Configuration</CardTitle>
              <CardDescription>
                Define the fields your agent will collect from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                  <TabsTrigger value="persona">Persona</TabsTrigger>
                  <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="schema" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Schema Fields</h3>
                        <p className="text-sm text-medium-gray mt-1">
                          Drag and drop to reorder fields
                        </p>
                      </div>
                      <Button onClick={handleAddField}>Add Field</Button>
                    </div>
                    <SchemaFieldList
                      fields={schemaFields}
                      onReorder={handleReorderFields}
                      onEdit={handleEditField}
                      onDelete={handleDeleteField}
                      onAdd={handleAddField}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="persona" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Persona Configuration</h3>
                    <p className="text-medium-gray">
                      Configure how your agent communicates with users
                    </p>
                    <div className="text-center py-12 text-medium-gray">
                      <p>Persona configuration coming soon</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="knowledge" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Knowledge Base</h3>
                    <p className="text-medium-gray">
                      Add documents and knowledge for your agent to reference
                    </p>
                    <div className="text-center py-12 text-medium-gray">
                      <p>Knowledge base coming soon</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="appearance" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Appearance</h3>
                    <p className="text-medium-gray">
                      Customize the look and feel of your agent
                    </p>
                    <div className="text-center py-12 text-medium-gray">
                      <p>Appearance settings coming soon</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Advanced Settings</h3>
                    <p className="text-medium-gray">
                      Configure webhooks, access controls, and more
                    </p>
                    {!isNew && id && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Webhook Configuration</CardTitle>
                          <CardDescription>
                            Set up webhooks to automatically forward session data to external systems
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/dashboard/agents/${id}/webhooks`)}
                            className="w-full"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Configure Webhooks
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    {isNew && (
                      <div className="text-center py-12 text-medium-gray">
                        <p>Save your agent first to configure webhooks and advanced settings</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:col-span-1">
          {showPreview && (
            <SchemaPreviewPanel fields={schemaFields} />
          )}
        </div>
      </div>

      {/* Field Configuration Dialog */}
      <FieldConfigurationDialog
        open={isFieldDialogOpen}
        onOpenChange={setIsFieldDialogOpen}
        field={editingField}
        existingKeys={existingKeys}
        onSubmit={handleFieldSubmit}
      />

      {/* Version History Dialog */}
      {!isNew && id && (
        <VersionHistoryDialog
          open={isVersionHistoryOpen}
          onOpenChange={setIsVersionHistoryOpen}
          agentId={id}
        />
      )}
    </div>
  );
}
