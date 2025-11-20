import { useState, useMemo } from "react";
import { useAgents, useDuplicateAgent } from "@/hooks/useAgents";
import { useDashboardStats } from "@/hooks/useStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentCard } from "@/components/dashboard/AgentCard";
import { CreateAgentModal } from "@/components/dashboard/CreateAgentModal";
import { DeleteAgentDialog } from "@/components/dashboard/DeleteAgentDialog";
import {
  Bot,
  Plus,
  Search,
  MessageSquare,
  TrendingUp,
  Loader2,
  Filter,
  X,
} from "lucide-react";
import type { Agent } from "@/types/agent";

type AgentStatus = "all" | "draft" | "published" | "archived";

export function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AgentStatus>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const { data: agents, isLoading: agentsLoading } = useAgents();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const duplicateAgent = useDuplicateAgent();

  // Filter and search agents
  const filteredAgents = useMemo(() => {
    if (!agents) return [];

    return agents.filter((agent) => {
      const matchesSearch =
        searchQuery === "" ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.public_url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchQuery, statusFilter]);

  const handleDuplicate = async (agentId: string) => {
    try {
      await duplicateAgent.mutateAsync(agentId);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteClick = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setAgentToDelete(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  // Calculate stats with fallback
  const dashboardStats = {
    totalAgents: stats?.total_agents ?? agents?.length ?? 0,
    activeSessions: stats?.active_sessions_today ?? 0,
    leadsCollected: stats?.leads_collected_month ?? 0,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-medium-gray mt-1">
            Manage your AI conversational forms
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Agent
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-medium-gray" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats.totalAgents}</div>
                <p className="text-xs text-medium-gray mt-1">Active agents</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <MessageSquare className="h-4 w-4 text-medium-gray" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats.activeSessions}</div>
                <p className="text-xs text-medium-gray mt-1">Today</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-medium-gray" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-medium-gray" />
            ) : (
              <>
                <div className="text-2xl font-bold">{dashboardStats.leadsCollected}</div>
                <p className="text-xs text-medium-gray mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Your Agents</CardTitle>
          <CardDescription>
            Manage and monitor your conversational forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
              <Input
                type="search"
                placeholder="Search agents by name or URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-medium-gray" />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as AgentStatus)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Agent List */}
          {agentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-base p-6 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-pale-gray" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-pale-gray rounded" />
                      <div className="h-4 w-32 bg-pale-gray rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAgents.length > 0 ? (
            <div className="space-y-4">
              {filteredAgents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <AgentCard
                    agent={agent}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDeleteClick}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {hasActiveFilters ? (
                <>
                  <Filter className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No agents found
                  </h3>
                  <p className="text-medium-gray mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <Bot className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No agents yet
                  </h3>
                  <p className="text-medium-gray mb-6">
                    Create your first AI conversational form to get started
                  </p>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Agent
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateAgentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      {agentToDelete && (
        <DeleteAgentDialog
          open={deleteDialogOpen}
          onOpenChange={handleDeleteConfirm}
          agentId={agentToDelete.id}
          agentName={agentToDelete.name}
        />
      )}
    </div>
  );
}
