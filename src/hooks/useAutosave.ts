import { useEffect, useRef } from "react";
import { useUpdateAgent } from "./useAgents";
import type { UpdateAgentInput } from "@/types/agent";

interface UseAutosaveOptions {
  agentId: string;
  data: Partial<UpdateAgentInput>;
  enabled?: boolean;
  delay?: number; // milliseconds
  onSave?: () => void;
  onError?: (error: Error) => void;
}

export function useAutosave({
  agentId,
  data,
  enabled = true,
  delay = 2000, // 2 seconds default
  onSave,
  onError,
}: UseAutosaveOptions) {
  const updateAgent = useUpdateAgent();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip autosave on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSavedRef.current = JSON.stringify(data);
      return;
    }

    if (!enabled || !agentId) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      const currentDataString = JSON.stringify(data);
      
      // Only save if data has changed
      if (currentDataString !== lastSavedRef.current) {
        updateAgent.mutate(
          {
            id: agentId,
            updates: data,
          },
          {
            onSuccess: () => {
              lastSavedRef.current = currentDataString;
              onSave?.();
            },
            onError: (error: Error) => {
              onError?.(error);
            },
          }
        );
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, agentId, enabled, delay, updateAgent, onSave, onError]);

  return {
    isSaving: updateAgent.isPending,
    lastSaved: lastSavedRef.current ? new Date() : null,
  };
}
