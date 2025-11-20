import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { useSession, useDeleteSession, useMarkSessionReviewed } from "@/hooks/useSessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Download,
  ExternalLink,
  Trash2,
  CheckCircle2,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { TranscriptPane } from "@/components/sessions/TranscriptPane";
import { CapturedDataPanel } from "@/components/sessions/CapturedDataPanel";
import { WebhookLogPanel } from "@/components/sessions/WebhookLogPanel";
import { ExportSessionDialog } from "@/components/sessions/ExportSessionDialog";
import { sessionsApi } from "@/api/sessions";

export function SessionInspectorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");

  const { data: session, isLoading, error } = useSession(id || "");
  const deleteSession = useDeleteSession();
  const markReviewed = useMarkSessionReviewed();

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteSession.mutateAsync(id);
      navigate("/dashboard/sessions");
    } catch (error) {
      // Error handled by mutation
    }
    setDeleteDialogOpen(false);
  };

  const handleMarkReviewed = async () => {
    if (!id) return;
    await markReviewed.mutateAsync(id);
  };

  const handleExport = async (format: "json" | "csv") => {
    if (!id) return;
    try {
      const blob = await sessionsApi.exportSession(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${id}-${format === "json" ? "data.json" : "data.csv"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Session exported as ${format.toUpperCase()}!`);
      setExportDialogOpen(false);
    } catch (error) {
      toast.error(`Failed to export session: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const copyPublicLink = () => {
    if (!session) return;
    const publicLink = `${window.location.origin}/sessions/${id}/readonly`;
    navigator.clipboard.writeText(publicLink);
    toast.success("Public link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                Session not found
              </h3>
              <p className="text-medium-gray mb-6">
                The session you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate("/dashboard/sessions")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    abandoned: "bg-gray-100 text-gray-800",
  };

  const statusLabels = {
    active: "Active",
    completed: "Completed",
    abandoned: "Abandoned",
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/sessions")}
            className="hover:bg-pale-gray"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Session Inspector</h1>
            <p className="text-medium-gray mt-1">
              {session.agent_name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={copyPublicLink}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Copy Link
          </Button>
          <Button
            variant="secondary"
            onClick={() => setExportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="secondary"
            onClick={handleMarkReviewed}
            disabled={markReviewed.isPending}
            className="flex items-center gap-2"
          >
            {markReviewed.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Mark Reviewed
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Session Metadata Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">Session Details</CardTitle>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}
                >
                  {statusLabels[session.status]}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-medium-gray">
                <span>ID: {session.id}</span>
                <span>•</span>
                <span>
                  Started: {format(new Date(session.started_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
                {session.completed_at && (
                  <>
                    <span>•</span>
                    <span>
                      Completed: {format(new Date(session.completed_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </>
                )}
                {session.duration_seconds && (
                  <>
                    <span>•</span>
                    <span>
                      Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/sessions/${id}/readonly`}
                target="_blank"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Link
              </Link>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-pale-gray px-6">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger
                  value="transcript"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Transcript
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Captured Data
                </TabsTrigger>
                <TabsTrigger
                  value="webhooks"
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  Webhook Log
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="transcript" className="mt-0 p-6">
              <TranscriptPane messages={session.messages || []} />
            </TabsContent>

            <TabsContent value="data" className="mt-0 p-6">
              <CapturedDataPanel
                sessionId={session.id}
                capturedData={session.collected_fields || {}}
              />
            </TabsContent>

            <TabsContent value="webhooks" className="mt-0 p-6">
              <WebhookLogPanel
                sessionId={session.id}
                webhookLogs={session.webhook_logs || []}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
              All session data, messages, and webhook logs will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <ExportSessionDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </div>
  );
}
