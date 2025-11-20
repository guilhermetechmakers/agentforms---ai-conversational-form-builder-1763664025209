import { useState } from 'react';
import { useKnowledgeDocuments, useKnowledgeStats } from '@/hooks/useKnowledge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UploadDocumentModal } from '@/components/knowledge/UploadDocumentModal';
import { DeleteDocumentDialog } from '@/components/knowledge/DeleteDocumentDialog';
import { ReindexDocumentDialog } from '@/components/knowledge/ReindexDocumentDialog';
import { KnowledgeRetrieval } from '@/components/knowledge/KnowledgeRetrieval';
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { KnowledgeDocument } from '@/types/knowledge';

export function KnowledgePage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reindexDialogOpen, setReindexDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<KnowledgeDocument | null>(null);

  const { data: documents, isLoading: documentsLoading } = useKnowledgeDocuments();
  const { data: stats, isLoading: statsLoading } = useKnowledgeStats();

  const getStatusBadge = (document: KnowledgeDocument) => {
    const statusConfig = {
      pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      indexing: { label: 'Indexing', icon: Loader2, className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-800' },
      error: { label: 'Error', icon: XCircle, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[document.status];
    const Icon = config.icon;

    return (
      <Badge className={cn('flex items-center gap-1', config.className)}>
        {document.status === 'indexing' && <Icon className="h-3 w-3 animate-spin" />}
        {document.status !== 'indexing' && <Icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  const getFileTypeIcon = () => {
    return <FileText className="h-5 w-5 text-primary" />;
  };

  const handleDelete = (document: KnowledgeDocument) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleReindex = (document: KnowledgeDocument) => {
    setSelectedDocument(document);
    setReindexDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-medium-gray mt-1">
            Upload documents and search your knowledge base
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats Cards */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <Database className="h-4 w-4 text-medium-gray" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_documents}</div>
              <p className="text-xs text-medium-gray mt-1">Documents indexed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chunks</CardTitle>
              <FileText className="h-4 w-4 text-medium-gray" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_chunks.toLocaleString()}</div>
              <p className="text-xs text-medium-gray mt-1">Text chunks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Indexing</CardTitle>
              <Loader2 className="h-4 w-4 text-medium-gray" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.indexing_in_progress}</div>
              <p className="text-xs text-medium-gray mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <TrendingUp className="h-4 w-4 text-medium-gray" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.retrieval_latency_ms}ms</div>
              <p className="text-xs text-medium-gray mt-1">Retrieval time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List - 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Manage your uploaded documents and their indexing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Chunks</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((document) => (
                        <TableRow key={document.id} className="hover:bg-pale-gray/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getFileTypeIcon()}
                              <span className="truncate max-w-[200px]">{document.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="uppercase">
                              {document.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(document)}</TableCell>
                          <TableCell>
                            {document.chunk_count !== undefined ? (
                              <span className="text-medium-gray">
                                {document.chunk_count.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-medium-gray">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-medium-gray">
                            {format(new Date(document.uploaded_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReindex(document)}
                                disabled={document.status === 'indexing'}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(document)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-medium-gray opacity-30" />
                  <p className="text-lg font-medium text-foreground mb-2">No documents yet</p>
                  <p className="text-sm text-medium-gray mb-4">
                    Upload your first document to get started
                  </p>
                  <Button onClick={() => setUploadModalOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Knowledge Retrieval - 1 column */}
        <div className="lg:col-span-1">
          <KnowledgeRetrieval />
        </div>
      </div>

      {/* Modals and Dialogs */}
      <UploadDocumentModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        document={selectedDocument}
      />
      <ReindexDocumentDialog
        open={reindexDialogOpen}
        onOpenChange={setReindexDialogOpen}
        document={selectedDocument}
      />
    </div>
  );
}
