import { useState, useRef } from 'react';
import { useUploadDocument } from '@/hooks/useKnowledge';
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
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDocumentModal({ open, onOpenChange }: UploadDocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunkingEnabled, setChunkingEnabled] = useState(true);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadDocument();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['text/plain', 'application/pdf', 'text/markdown'];
      const validExtensions = ['.txt', '.pdf', '.md', '.markdown'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        alert('Please select a valid file type (TXT, PDF, or Markdown)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        chunking_enabled: chunkingEnabled,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
      });
      
      // Reset form
      setSelectedFile(null);
      setChunkingEnabled(true);
      setChunkSize(1000);
      setChunkOverlap(200);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (file: File): string => {
    if (file.type === 'application/pdf') return 'PDF';
    if (file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown')) return 'Markdown';
    return 'Text';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document to add to your knowledge base. Supported formats: TXT, PDF, Markdown
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Selection */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                selectedFile
                  ? "border-primary bg-primary/5"
                  : "border-pale-gray hover:border-primary hover:bg-pale-gray/50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".txt,.pdf,.md,.markdown"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-2">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-medium-gray">
                      {getFileType(selectedFile)} • {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="mt-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-medium-gray" />
                  <div>
                    <p className="font-medium text-foreground">Click to upload or drag and drop</p>
                    <p className="text-sm text-medium-gray mt-1">
                      TXT, PDF, or Markdown (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chunking Options */}
          <div className="space-y-4 border-t border-pale-gray pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="chunking-enabled">Enable Chunking</Label>
                <p className="text-sm text-medium-gray">
                  Split document into smaller chunks for better retrieval
                </p>
              </div>
              <Switch
                id="chunking-enabled"
                checked={chunkingEnabled}
                onCheckedChange={setChunkingEnabled}
              />
            </div>

            {chunkingEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-pale-gray">
                <div className="space-y-2">
                  <Label htmlFor="chunk-size">Chunk Size (tokens)</Label>
                  <Input
                    id="chunk-size"
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
                  <Label htmlFor="chunk-overlap">Chunk Overlap (tokens)</Label>
                  <Input
                    id="chunk-overlap"
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
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-medium-gray">Uploading...</span>
                <span className="text-medium-gray">Processing document</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploadMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
