import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, LayoutDashboard, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorHeader } from "@/components/layout/ErrorHeader";
import { Footer } from "@/components/layout/Footer";
import { docsApi } from "@/api/docs";
import { toast } from "sonner";

export function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await docsApi.search(searchQuery.trim());
      if (results.total > 0) {
        // Navigate to help page with search query
        navigate(`/dashboard/help?q=${encodeURIComponent(searchQuery.trim())}`);
        toast.success(`Found ${results.total} result${results.total > 1 ? 's' : ''}`);
      } else {
        toast.info("No results found. Try different keywords.");
      }
    } catch (error) {
      toast.error("Search failed. Please try again.");
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorHeader />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
          {/* 404 Title Section */}
          <div className="text-center space-y-4">
            <h1 className="text-7xl md:text-8xl font-bold text-charcoal animate-bounce-in">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-charcoal">
              Page Not Found
            </h2>
            <p className="text-medium-gray text-lg max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Search Bar */}
          <Card className="animate-fade-in-up animation-delay-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search for what you need
              </CardTitle>
              <CardDescription>
                Try searching for documentation, FAQs, or help articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-medium-gray" />
                  <Input
                    type="search"
                    placeholder="Search documentation, FAQs, tutorials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up animation-delay-200">
            <Link to="/">
              <Card className="h-full hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal mb-1">Go Home</h3>
                    <p className="text-sm text-medium-gray">Return to the landing page</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard">
              <Card className="h-full hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal mb-1">Go to Dashboard</h3>
                    <p className="text-sm text-medium-gray">Access your workspace</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/dashboard/help">
              <Card className="h-full hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal mb-1">Help & Docs</h3>
                    <p className="text-sm text-medium-gray">Browse documentation</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/legal/privacy-policy">
              <Card className="h-full hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-charcoal mb-1">Legal & Privacy</h3>
                    <p className="text-sm text-medium-gray">View policies and terms</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
