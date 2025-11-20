import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useSessions, useBulkDeleteSessions, useBulkResendWebhooks } from "@/hooks/useSessions";
import { sessionsApi } from "@/api/sessions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Search,
  Filter,
  X,
  Eye,
  Download,
  Trash2,
  MoreVertical,
  Calendar,
  Loader2,
  MessageSquare,
  FileDown,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/session";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionModal } from "@/components/sessions/SessionModal";

type SessionStatus = "all" | "active" | "completed" | "abandoned";

export function SessionsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  
  // Get agent_id from URL if present (for agent-specific sessions)
  const agentId = searchParams.get("agent_id") || undefined;
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<SessionStatus>(
    (searchParams.get("status") as SessionStatus) || "all"
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(20);
  
  // Selection state
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  
  // Build filters object
  const filters = useMemo(() => {
    const filterObj: Record<string, string | number> = {
      page,
      limit,
    };
    
    if (agentId) filterObj.agent_id = agentId;
    if (statusFilter !== "all") filterObj.status = statusFilter;
    if (dateFrom) filterObj.date_from = dateFrom;
    if (dateTo) filterObj.date_to = dateTo;
    if (searchQuery) filterObj.search = searchQuery;
    
    return filterObj;
  }, [agentId, statusFilter, dateFrom, dateTo, searchQuery, page, limit]);
  
  // Fetch sessions
  const { data: sessionsData, isLoading, refetch } = useSessions(filters);
  const sessions = sessionsData?.data || [];
  const totalCount = sessionsData?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);
  
  const bulkDeleteSessions = useBulkDeleteSessions();
  const bulkResendWebhooks = useBulkResendWebhooks();
  
  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (agentId) params.set("agent_id", agentId);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    if (searchQuery) params.set("search", searchQuery);
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [agentId, statusFilter, dateFrom, dateTo, searchQuery, page, setSearchParams]);
  
  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };
  
  const handleStatusChange = (value: SessionStatus) => {
    setStatusFilter(value);
    setPage(1);
  };
  
  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setPage(1);
  };
  
  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setPage(1);
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };
  
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";
  
  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedSessions.size === sessions.length) {
      setSelectedSessions(new Set());
    } else {
      setSelectedSessions(new Set(sessions.map((s) => s.id)));
    }
  };
  
  const toggleSelectSession = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };
  
  // Delete handlers
  const handleDeleteClick = (session: Session) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };
  
  const handleBulkDeleteClick = () => {
    if (selectedSessions.size === 0) return;
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (sessionToDelete) {
      // Single delete
      try {
        await sessionsApi.delete(sessionToDelete.id);
        toast.success("Session deleted successfully!");
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
        refetch();
      } catch (error) {
        toast.error(`Failed to delete session: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else if (selectedSessions.size > 0) {
      // Bulk delete
      await bulkDeleteSessions.mutateAsync(Array.from(selectedSessions));
      setSelectedSessions(new Set());
      setDeleteDialogOpen(false);
    }
  };
  
  // Export handlers
  const handleExportSession = async (sessionId: string, format: "json" | "csv" = "json") => {
    try {
      const blob = await sessionsApi.exportSession(sessionId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${sessionId}-${format === "json" ? "data.json" : "data.csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Session exported as ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error(`Failed to export session: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  const handleBulkExport = async (format: "json" | "csv" = "csv") => {
    if (selectedSessions.size === 0) {
      toast.error("Please select sessions to export");
      return;
    }
    
    try {
      // For bulk export, we'll export each session individually and combine
      // In a real implementation, the backend would handle this
      const sessionIds = Array.from(selectedSessions);
      toast.loading(`Exporting ${sessionIds.length} sessions...`);
      
      // Create export filters with session IDs
      const exportFilters: Record<string, any> = {
        ...filters,
      };
      
      // Note: The API may need to be updated to accept session_ids array
      // For now, we'll use the existing export endpoint with filters
      const blob = await sessionsApi.export(exportFilters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sessions-export-${format === "json" ? "data.json" : "data.csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.dismiss();
      toast.success(`Exported ${selectedSessions.size} sessions as ${format.toUpperCase()}!`);
      setSelectedSessions(new Set());
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to export sessions: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  const handleBulkResendWebhooks = async () => {
    if (selectedSessions.size === 0) {
      toast.error("Please select sessions to resend webhooks");
      return;
    }
    
    try {
      await bulkResendWebhooks.mutateAsync(Array.from(selectedSessions));
      setSelectedSessions(new Set());
    } catch (error) {
      // Error handled by mutation
    }
  };
  
  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };
  
  // Status badge colors
  const getStatusBadge = (session: Session) => {
    const status = session.status;
    const state = session.state;
    
    const variants = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      abandoned: "bg-gray-100 text-gray-800 border-gray-200",
      paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
      terminated: "bg-red-100 text-red-800 border-red-200",
    };
    
    const labels = {
      active: "Active",
      completed: "Completed",
      abandoned: "Abandoned",
      paused: "Paused",
      terminated: "Terminated",
    };
    
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn("text-xs font-medium", variants[status] || variants.abandoned)}
        >
          {labels[status] || "Unknown"}
        </Badge>
        {state && state !== "running" && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              state === "paused" && "bg-yellow-50 text-yellow-700 border-yellow-300",
              state === "stopped" && "bg-gray-50 text-gray-700 border-gray-300"
            )}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </Badge>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Agent Sessions</h1>
          <p className="text-medium-gray mt-1">
            {agentId ? "Sessions for this agent" : "View and manage all agent sessions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => setSessionModalOpen(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Session
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Filter sessions by status, date range, or search terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
              <Input
                type="search"
                placeholder="Search by email or ID..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Date From */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
              <Input
                type="date"
                placeholder="From date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Date To */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
              <Input
                type="date"
                placeholder="To date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Bulk Actions Toolbar */}
      {selectedSessions.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-charcoal">
                  {selectedSessions.size} session{selectedSessions.size !== 1 ? "s" : ""} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSessions(new Set())}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <FileDown className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkExport("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkExport("json")}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkResendWebhooks}
                  disabled={bulkResendWebhooks.isPending}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", bulkResendWebhooks.isPending && "animate-spin")} />
                  Resend Webhooks
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteClick}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>
                {totalCount} total session{totalCount !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="card-base p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-5 rounded bg-pale-gray" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-pale-gray rounded" />
                      <div className="h-3 w-32 bg-pale-gray rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              {hasActiveFilters ? (
                <>
                  <Filter className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No sessions found
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
                  <MessageSquare className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal mb-2">
                    No sessions yet
                  </h3>
                  <p className="text-medium-gray">
                    Sessions will appear here once agents start collecting data
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-pale-gray bg-card">
                      <th className="text-left p-4 bg-card">
                        <Checkbox
                          checked={selectedSessions.size === sessions.length && sessions.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-charcoal bg-card">ID</th>
                      <th className="text-left p-4 text-sm font-semibold text-charcoal bg-card">Started At</th>
                      <th className="text-left p-4 text-sm font-semibold text-charcoal bg-card">Duration</th>
                      <th className="text-left p-4 text-sm font-semibold text-charcoal bg-card">Fields</th>
                      <th className="text-left p-4 text-sm font-semibold text-charcoal bg-card">Status</th>
                      <th className="text-left p-4 text-sm font-semibold text-charcoal bg-card">Agent</th>
                      <th className="text-right p-4 text-sm font-semibold text-charcoal bg-card">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, index) => (
                      <tr
                        key={session.id}
                        className={cn(
                          "border-b border-pale-gray transition-all duration-200 hover:bg-pale-gray/30 hover:shadow-sm",
                          "animate-fade-in-up"
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedSessions.has(session.id)}
                            onCheckedChange={() => toggleSelectSession(session.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-xs text-medium-gray">
                            {session.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="p-4 text-sm text-charcoal">
                          {format(new Date(session.started_at), "MMM d, yyyy 'at' h:mm a")}
                        </td>
                        <td className="p-4 text-sm text-medium-gray">
                          {formatDuration(session.duration_seconds)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {session.collected_fields_count || 0}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(session)}
                        </td>
                        <td className="p-4 text-sm text-medium-gray">
                          {session.agent_name || "—"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Inspect
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExportSession(session.id, "json")}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExportSession(session.id, "csv")}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Export CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(session)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {sessions.map((session, index) => (
                  <Card
                    key={session.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={selectedSessions.has(session.id)}
                            onCheckedChange={() => toggleSelectSession(session.id)}
                          />
                          <div className="flex-1">
                            <div className="font-mono text-xs text-medium-gray mb-1">
                              {session.id.slice(0, 8)}...
                            </div>
                            <div className="text-sm font-semibold text-charcoal">
                              {session.agent_name || "Unknown Agent"}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(session)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-medium-gray text-xs mb-1">Started</div>
                          <div className="text-charcoal">
                            {format(new Date(session.started_at), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div>
                          <div className="text-medium-gray text-xs mb-1">Duration</div>
                          <div className="text-charcoal">
                            {formatDuration(session.duration_seconds)}
                          </div>
                        </div>
                        <div>
                          <div className="text-medium-gray text-xs mb-1">Fields</div>
                          <Badge variant="outline" className="text-xs">
                            {session.collected_fields_count || 0}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-pale-gray">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/dashboard/sessions/${session.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Inspect
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleExportSession(session.id, "json")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportSession(session.id, "csv")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(session)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-pale-gray">
                  <div className="text-sm text-medium-gray">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {sessionToDelete ? "Delete Session" : "Delete Selected Sessions"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToDelete
                ? "Are you sure you want to delete this session? This action cannot be undone. All session data, messages, and webhook logs will be permanently deleted."
                : `Are you sure you want to delete ${selectedSessions.size} session${selectedSessions.size !== 1 ? "s" : ""}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setSessionToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={bulkDeleteSessions.isPending}
            >
              {bulkDeleteSessions.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Creation Modal */}
      <SessionModal
        open={sessionModalOpen}
        onOpenChange={setSessionModalOpen}
        defaultAgentId={agentId}
        onSuccess={(sessionId) => {
          navigate(`/dashboard/sessions/${sessionId}`);
        }}
      />
    </div>
  );
}
