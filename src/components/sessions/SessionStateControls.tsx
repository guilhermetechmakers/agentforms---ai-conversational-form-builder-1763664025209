import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Pause,
  Play,
  Square,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePauseSession,
  useResumeSession,
  useTerminateSession,
} from "@/hooks/useSessions";
import type { Session } from "@/types/session";

interface SessionStateControlsProps {
  session: Session;
}

export function SessionStateControls({ session }: SessionStateControlsProps) {
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const [terminateDialogOpen, setTerminateDialogOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [terminateReason, setTerminateReason] = useState("");

  const pauseSession = usePauseSession();
  const resumeSession = useResumeSession();
  const terminateSession = useTerminateSession();

  const isRunning = session.state === "running" || (!session.state && session.status === "active");
  const isPaused = session.state === "paused" || session.status === "paused";
  const isStopped = session.state === "stopped" || session.status === "terminated" || session.status === "completed";

  const handlePause = async () => {
    if (!session.id) return;
    await pauseSession.mutateAsync({
      sessionId: session.id,
      reason: pauseReason || undefined,
    });
    setPauseDialogOpen(false);
    setPauseReason("");
  };

  const handleResume = async () => {
    if (!session.id) return;
    await resumeSession.mutateAsync(session.id);
  };

  const handleTerminate = async () => {
    if (!session.id) return;
    await terminateSession.mutateAsync({
      sessionId: session.id,
      reason: terminateReason || undefined,
    });
    setTerminateDialogOpen(false);
    setTerminateReason("");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Pause Button */}
      {isRunning && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPauseDialogOpen(true)}
          disabled={pauseSession.isPending}
          className="flex items-center gap-2"
        >
          {pauseSession.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
          Pause
        </Button>
      )}

      {/* Resume Button */}
      {isPaused && (
        <Button
          variant="default"
          size="sm"
          onClick={handleResume}
          disabled={resumeSession.isPending}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          {resumeSession.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Resume
        </Button>
      )}

      {/* Terminate Button */}
      {!isStopped && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setTerminateDialogOpen(true)}
          disabled={terminateSession.isPending}
          className="flex items-center gap-2"
        >
          {terminateSession.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          Terminate
        </Button>
      )}

      {/* State Badge */}
      <div
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          isRunning && "bg-green-100 text-green-800",
          isPaused && "bg-yellow-100 text-yellow-800",
          isStopped && "bg-gray-100 text-gray-800"
        )}
      >
        {isRunning ? "Running" : isPaused ? "Paused" : "Stopped"}
      </div>

      {/* Pause Confirmation Dialog */}
      <AlertDialog open={pauseDialogOpen} onOpenChange={setPauseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause Session</AlertDialogTitle>
            <AlertDialogDescription>
              Pausing this session will temporarily stop data collection. You can resume it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pause-reason">Reason (optional)</Label>
              <Textarea
                id="pause-reason"
                placeholder="Enter reason for pausing..."
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPauseReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePause}
              disabled={pauseSession.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {pauseSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pausing...
                </>
              ) : (
                "Pause Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Terminate Confirmation Dialog */}
      <AlertDialog open={terminateDialogOpen} onOpenChange={setTerminateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Session</AlertDialogTitle>
            <AlertDialogDescription>
              Terminating this session will permanently stop data collection. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="terminate-reason">Reason (optional)</Label>
              <Textarea
                id="terminate-reason"
                placeholder="Enter reason for terminating..."
                value={terminateReason}
                onChange={(e) => setTerminateReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTerminateReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              disabled={terminateSession.isPending}
              className="bg-red-500 hover:bg-red-600"
            >
              {terminateSession.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Terminating...
                </>
              ) : (
                "Terminate Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
