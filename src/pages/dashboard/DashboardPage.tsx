import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgents } from "@/hooks/useAgents";
import { Bot, Plus, ExternalLink, Edit, Copy, Trash2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export function DashboardPage() {
  const { data: agents, isLoading } = useAgents();

  const stats = {
    totalAgents: agents?.length || 0,
    activeSessions: 0, // TODO: Calculate from sessions
    leadsCollected: 0, // TODO: Calculate from sessions
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-medium-gray mt-1">Manage your AI conversational forms</p>
        </div>
        <Link to="/dashboard/agents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-medium-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgents}</div>
            <p className="text-xs text-medium-gray mt-1">Active agents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-medium-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-medium-gray mt-1">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Collected</CardTitle>
            <MessageSquare className="h-4 w-4 text-medium-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leadsCollected}</div>
            <p className="text-xs text-medium-gray mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Agents</CardTitle>
          <CardDescription>Manage and monitor your conversational forms</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-medium-gray">Loading agents...</div>
          ) : agents && agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-4 border border-pale-gray rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: agent.primary_color || "#7B8CFF" }}
                    >
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal">{agent.name}</h3>
                      <p className="text-sm text-medium-gray">
                        {agent.session_count} sessions • Last activity{" "}
                        {format(new Date(agent.last_activity), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-medium-gray mt-1">
                        {agent.public_url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === "published"
                            ? "bg-green-100 text-green-700"
                            : agent.status === "draft"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/agents/${agent.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href={agent.public_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bot className="mx-auto h-12 w-12 text-medium-gray mb-4" />
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                No agents yet
              </h3>
              <p className="text-medium-gray mb-6">
                Create your first AI conversational form to get started
              </p>
              <Link to="/dashboard/agents/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Agent
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
