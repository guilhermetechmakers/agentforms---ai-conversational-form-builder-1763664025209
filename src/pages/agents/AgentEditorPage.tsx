import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgent } from "@/hooks/useAgents";

export function AgentEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: agent, isLoading } = useAgent(id || "");
  const [activeTab, setActiveTab] = useState("schema");

  if (isLoading) {
    return <div className="text-center py-8">Loading agent...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">
            {id ? "Edit Agent" : "Create Agent"}
          </h1>
          <p className="text-medium-gray mt-1">
            {id ? "Update your agent configuration" : "Build your AI conversational form"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Publish</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="agent-name">Agent Name</Label>
              <Input
                id="agent-name"
                placeholder="My Conversational Form"
                defaultValue={agent?.name}
                className="mt-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label>Status</Label>
              <span className="px-3 py-2 rounded-lg bg-gray-100 text-sm">
                {agent?.status || "draft"}
              </span>
            </div>
          </div>
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
                  <h3 className="text-lg font-semibold">Schema Fields</h3>
                  <Button>Add Field</Button>
                </div>
                <p className="text-medium-gray">
                  Define the fields your agent will collect from users
                </p>
                {/* Schema builder will go here */}
              </div>
            </TabsContent>

            <TabsContent value="persona" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Persona Configuration</h3>
                <p className="text-medium-gray">
                  Configure how your agent communicates with users
                </p>
                {/* Persona config will go here */}
              </div>
            </TabsContent>

            <TabsContent value="knowledge" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Knowledge Base</h3>
                <p className="text-medium-gray">
                  Add documents and knowledge for your agent to reference
                </p>
                {/* Knowledge upload will go here */}
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appearance</h3>
                <p className="text-medium-gray">
                  Customize the look and feel of your agent
                </p>
                {/* Appearance config will go here */}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                <p className="text-medium-gray">
                  Configure webhooks, access controls, and more
                </p>
                {/* Advanced settings will go here */}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
