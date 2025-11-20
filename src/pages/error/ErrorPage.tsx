import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Home, Mail, MessageCircle, AlertCircle, LayoutDashboard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorHeader } from "@/components/layout/ErrorHeader";
import { Footer } from "@/components/layout/Footer";

export function ErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Small delay for better UX
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorHeader />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
          {/* 500 Title Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-deep-orange/10 mb-4">
              <AlertCircle className="h-12 w-12 text-deep-orange" />
            </div>
            <h1 className="text-7xl md:text-8xl font-bold text-charcoal animate-bounce-in">
              500
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-charcoal">
              Internal Server Error
            </h2>
            <p className="text-medium-gray text-lg max-w-md mx-auto">
              Something went wrong on our end. We're working to fix the issue.
            </p>
          </div>

          {/* Main Action Card */}
          <Card className="animate-fade-in-up animation-delay-100">
            <CardHeader>
              <CardTitle className="text-lg">What can you do?</CardTitle>
              <CardDescription>
                Try these options to resolve the issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full h-12 text-base"
                size="lg"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? "Retrying..." : "Retry Page"}
              </Button>
              
              <Link to="/" className="block">
                <Button variant="secondary" className="w-full h-12 text-base" size="lg">
                  <Home className="h-5 w-5 mr-2" />
                  Go to Home Page
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Support Contact Card */}
          <Card className="animate-fade-in-up animation-delay-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Need Help?
              </CardTitle>
              <CardDescription>
                Contact our support team if the problem persists
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-pale-gray/50">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-charcoal mb-1">Email Support</p>
                    <a
                      href="mailto:support@agentforms.com"
                      className="text-sm text-primary hover:underline"
                    >
                      support@agentforms.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-pale-gray/50">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-charcoal mb-1">Help Center</p>
                    <Link
                      to="/dashboard/help"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit Help & Documentation
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-pale-gray">
                <p className="text-sm text-medium-gray mb-3">
                  If you continue to experience issues, please include:
                </p>
                <ul className="text-sm text-medium-gray space-y-1 list-disc list-inside">
                  <li>What you were trying to do when the error occurred</li>
                  <li>The time the error happened</li>
                  <li>Any error messages you saw</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Additional Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Link to="/dashboard">
              <Button variant="outline" className="w-full sm:w-auto">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/dashboard/help">
              <Button variant="outline" className="w-full sm:w-auto">
                <HelpCircle className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
