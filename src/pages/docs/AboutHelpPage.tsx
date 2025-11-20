import { useState, useMemo } from "react";
import { Search, BookOpen, HelpCircle, GraduationCap, MessageCircle, Mail, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDocumentation,
  useFAQs,
  useTutorials,
  useSearchDocs,
} from "@/hooks/useDocs";
import type { DocumentationSearchResult, Documentation, FAQ, Tutorial } from "@/types/docs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "getting-started", name: "Getting Started", icon: BookOpen },
  { id: "agent-builder", name: "Agent Builder", icon: BookOpen },
  { id: "webhooks-api", name: "Webhooks & API", icon: ExternalLink },
  { id: "billing", name: "Billing", icon: BookOpen },
  { id: "security", name: "Security", icon: BookOpen },
];

export function AboutHelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("docs");

  // Data hooks
  const { data: documentation, isLoading: docsLoading } = useDocumentation(selectedCategory);
  const { data: faqs, isLoading: faqsLoading } = useFAQs(selectedCategory);
  const { data: tutorials, isLoading: tutorialsLoading } = useTutorials(selectedCategory);
  const { data: searchResults, isLoading: searchLoading } = useSearchDocs(searchQuery);

  // Filter documentation by category
  const filteredDocs = useMemo(() => {
    if (!documentation) return [];
    if (!selectedCategory) return documentation;
    return documentation.filter((doc) => doc.category === selectedCategory);
  }, [documentation, selectedCategory]);

  // Show search results when query exists
  const showSearchResults = searchQuery.length > 0;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategorySelect = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setSearchQuery(""); // Clear search when selecting category
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">About & Help</h1>
        <p className="text-medium-gray mt-1">
          Documentation, tutorials, FAQs, and developer resources
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-medium-gray" />
            <Input
              type="text"
              placeholder="Search documentation, FAQs, and tutorials..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Navigation */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategorySelect(undefined)}
          className={cn(
            selectedCategory === undefined
              ? "bg-charcoal text-white"
              : "bg-white text-charcoal border-pale-gray hover:bg-pale-gray"
          )}
        >
          All Categories
        </Button>
        {CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(category.id)}
            className={cn(
              selectedCategory === category.id
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal border-pale-gray hover:bg-pale-gray"
            )}
          >
            <category.icon className="h-4 w-4 mr-2" />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      {showSearchResults ? (
        <SearchResultsView
          results={searchResults}
          isLoading={searchLoading}
          query={searchQuery}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-pale-gray rounded-lg">
            <TabsTrigger value="docs" className="data-[state=active]:bg-white">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="data-[state=active]:bg-white">
              <GraduationCap className="h-4 w-4 mr-2" />
              Tutorials
            </TabsTrigger>
            <TabsTrigger value="faqs" className="data-[state=active]:bg-white">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-6">
            {docsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-medium-gray" />
              </div>
            ) : filteredDocs && filteredDocs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc: Documentation) => (
                  <Card
                    key={doc.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {doc.category}
                        </Badge>
                      </div>
                      <CardDescription>
                        Updated {format(new Date(doc.last_updated), "MMM dd, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-medium-gray line-clamp-3">
                        {doc.content.substring(0, 150)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <p className="text-medium-gray">
                    {selectedCategory
                      ? `No documentation found in ${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
                      : "No documentation available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-6">
            {tutorialsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-medium-gray" />
              </div>
            ) : tutorials && tutorials.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {tutorials.map((tutorial: Tutorial) => (
                  <Card
                    key={tutorial.id}
                    className="transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                        <Badge variant="outline" className="ml-2">
                          {tutorial.estimated_time} min
                        </Badge>
                      </div>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-charcoal">Steps:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-medium-gray">
                          {tutorial.steps.slice(0, 3).map((step, idx) => (
                            <li key={idx}>{step.title}</li>
                          ))}
                          {tutorial.steps.length > 3 && (
                            <li className="text-primary">
                              +{tutorial.steps.length - 3} more steps
                            </li>
                          )}
                        </ol>
                      </div>
                      <Button className="mt-4 w-full" variant="outline">
                        View Tutorial
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <p className="text-medium-gray">
                    {selectedCategory
                      ? `No tutorials found in ${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
                      : "No tutorials available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            {faqsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-medium-gray" />
              </div>
            ) : faqs && faqs.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq: FAQ) => (
                      <AccordionItem key={faq.id} value={faq.id}>
                        <AccordionTrigger className="text-left font-medium text-charcoal">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-medium-gray prose prose-sm max-w-none">
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <HelpCircle className="mx-auto h-12 w-12 text-medium-gray mb-4" />
                  <p className="text-medium-gray">
                    {selectedCategory
                      ? `No FAQs found in ${CATEGORIES.find((c) => c.id === selectedCategory)?.name}`
                      : "No FAQs available"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Contact Support Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-lavender/20 border-primary/20">
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Can't find what you're looking for? Our support team is here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="flex-1" variant="default">
              <MessageCircle className="mr-2 h-4 w-4" />
              Start Live Chat
            </Button>
            <Button className="flex-1" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Search Results View Component
interface SearchResultsViewProps {
  results: DocumentationSearchResult | undefined;
  isLoading: boolean;
  query: string;
}

function SearchResultsView({ results, isLoading, query }: SearchResultsViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-medium-gray" />
      </div>
    );
  }

  if (!results || results.total === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-medium-gray mb-4" />
          <p className="text-medium-gray">
            No results found for "{query}"
          </p>
          <p className="text-sm text-medium-gray mt-2">
            Try different keywords or browse by category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-charcoal">
          Search Results for "{query}"
        </h2>
        <p className="text-medium-gray mt-1">
          Found {results.total} result{results.total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Documentation Results */}
      {results.documentation && results.documentation.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Documentation ({results.documentation.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.documentation.map((doc: Documentation) => (
              <Card
                key={doc.id}
                className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>
                    {doc.category} • Updated{" "}
                    {format(new Date(doc.last_updated), "MMM dd, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-medium-gray line-clamp-3">
                    {doc.content.substring(0, 150)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Results */}
      {results.faqs && results.faqs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            FAQs ({results.faqs.length})
          </h3>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {results.faqs.map((faq: FAQ) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left font-medium text-charcoal">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-medium-gray">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tutorial Results */}
      {results.tutorials && results.tutorials.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-charcoal mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Tutorials ({results.tutorials.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {results.tutorials.map((tutorial: Tutorial) => (
              <Card
                key={tutorial.id}
                className="transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <Badge variant="outline" className="ml-2">
                      {tutorial.estimated_time} min
                    </Badge>
                  </div>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Tutorial
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
