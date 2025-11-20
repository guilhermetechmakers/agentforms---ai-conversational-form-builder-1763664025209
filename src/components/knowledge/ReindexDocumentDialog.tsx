import { useState } from 'react';
import { useReindexDocument } from '@/hooks/useKnowledge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, RefreshCw } from 'lucide-react';
import type { KnowledgeDocument } from '@/types/knowledge';

interface ReindexDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: KnowledgeDocument | null;
}

export function ReindexDocumentDialog({
  open,
  onOpenChange,
  document,
}: ReindexDocumentDialogProps) {
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const [force, setForce] = useState(false);

  const reindexMutation = useReindexDocument();

  const handleReindex = async () => {
    if (!document) return;

    try {
      await reindexMutation.mutateAsync({
        document_id: document.id,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        force,
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Re-index Document</DialogTitle>
          <DialogDescription>
            Re-process "{document?.name}" with new chunking settings. This will regenerate embeddings for all chunks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reindex-chunk-size">Chunk Size (tokens)</Label>
            <Input
              id="reindex-chunk-size"
              type="number"
              min={100}
              max={2000}
              step={100}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
            />
            <p className="text-xs text-medium-gray">
              Recommended: 500-1000 tokens per chunk
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reindex-chunk-overlap">Chunk Overlap (tokens)</Label>
            <Input
              id="reindex-chunk-overlap"
              type="number"
              min={0}
              max={500}
              step={50}
              value={chunkOverlap}
              onChange={(e) => setChunkOverlap(Number(e.target.value))}
            />
            <p className="text-xs text-medium-gray">
              Overlap helps maintain context between chunks
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="force-reindex">Force Re-index</Label>
              <p className="text-sm text-medium-gray">
                Re-index even if document is already indexed
              </p>
            </div>
            <Switch
              id="force-reindex"
              checked={force}
              onCheckedChange={setForce}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={reindexMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleReindex}
            disabled={reindexMutation.isPending}
          >
            {reindexMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Re-indexing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Re-indexing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
