import { useState } from 'react';
import { useKnowledgeSearch } from '@/hooks/useKnowledge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RetrievalResult } from '@/types/knowledge';

export function KnowledgeRetrieval() {
  const [searchQuery, setSearchQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [minScore, setMinScore] = useState(0.5);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);

  const { data: searchResults, isLoading, isFetching } = useKnowledgeSearch(
    {
      query: searchQuery,
      top_k: topK,
      min_score: minScore,
    },
    isSearchEnabled && searchQuery.trim().length > 0
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      setIsSearchEnabled(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Retrieval</CardTitle>
        <CardDescription>
          Search your knowledge base to find relevant information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-medium-gray" />
              <Input
                type="text"
                placeholder="Enter your search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading || searchQuery.trim().length === 0}>
              {isLoading || isFetching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Search Options */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <label htmlFor="top-k" className="text-medium-gray">
                Top K:
              </label>
              <Input
                id="top-k"
                type="number"
                min={1}
                max={20}
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-20 h-8"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="min-score" className="text-medium-gray">
                Min Score:
              </label>
              <Input
                id="min-score"
                type="number"
                min={0}
                max={1}
                step={0.1}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-20 h-8"
              />
            </div>
          </div>
        </form>

        {/* Search Results */}
        {isSearchEnabled && searchQuery.trim().length > 0 && (
          <div className="space-y-4">
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : searchResults?.results && searchResults.results.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm text-medium-gray">
                  <span>
                    Found {searchResults.total_results} result{searchResults.total_results !== 1 ? 's' : ''}
                  </span>
                  <span>Query time: {searchResults.query_time_ms}ms</span>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {searchResults.results.map((result: RetrievalResult, index: number) => (
                    <AccordionItem key={result.chunk.id} value={`result-${index}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-start gap-3 flex-1 text-left">
                          <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground truncate">
                                {result.document.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs",
                                  result.similarity_score >= 0.8
                                    ? "bg-green-100 text-green-800"
                                    : result.similarity_score >= 0.6
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                )}
                              >
                                {(result.similarity_score * 100).toFixed(0)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-medium-gray line-clamp-2">
                              {result.chunk.content.substring(0, 150)}...
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pl-8">
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Content:</p>
                            <p className="text-sm text-medium-gray whitespace-pre-wrap bg-pale-gray p-3 rounded-lg">
                              {result.chunk.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-medium-gray">
                            <span>Chunk #{result.chunk.chunk_index}</span>
                            <span>•</span>
                            <span>Document: {result.document.type.toUpperCase()}</span>
                            {result.metadata && Object.keys(result.metadata).length > 0 && (
                              <>
                                <span>•</span>
                                <span>Metadata available</span>
                              </>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </>
            ) : (
              <div className="text-center py-8 text-medium-gray">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No results found for your query.</p>
                <p className="text-sm mt-1">Try adjusting your search terms or filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isSearchEnabled && searchQuery.trim().length === 0 && (
          <div className="text-center py-12 text-medium-gray">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Start searching your knowledge base</p>
            <p className="text-sm">Enter a query above to find relevant information</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
