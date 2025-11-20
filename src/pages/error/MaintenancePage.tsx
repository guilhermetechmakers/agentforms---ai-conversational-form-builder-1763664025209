import { Link } from "react-router-dom";
import { Wrench, Clock, Mail, MessageCircle, Home, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorHeader } from "@/components/layout/ErrorHeader";
import { Footer } from "@/components/layout/Footer";

export function MaintenancePage() {
  // Calculate estimated completion time (can be made dynamic via props or API)
  const estimatedCompletion = new Date();
  estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + 30);
  
  const formatETA = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorHeader />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-2xl space-y-8 animate-fade-in-up">
          {/* Maintenance Title Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-light-orange/10 mb-4">
              <Wrench className="h-12 w-12 text-light-orange" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal animate-bounce-in">
              Under Maintenance
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-charcoal">
              We'll be back soon
            </h2>
            <p className="text-medium-gray text-lg max-w-md mx-auto">
              We're currently performing scheduled maintenance to improve your experience.
            </p>
          </div>

          {/* ETA Card */}
          <Card className="animate-fade-in-up animation-delay-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Estimated Completion Time
              </CardTitle>
              <CardDescription>
                We expect to be back online shortly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center p-6 rounded-lg bg-primary/5 border-2 border-primary/20">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">
                    {formatETA(estimatedCompletion)}
                  </p>
                  <p className="text-sm text-medium-gray">
                    Estimated completion: {estimatedCompletion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-pale-gray/50">
                <AlertCircle className="h-5 w-5 text-deep-orange mt-0.5 flex-shrink-0" />
                <div className="text-sm text-medium-gray">
                  <p className="font-medium text-charcoal mb-1">What's happening?</p>
                  <p>
                    We're updating our systems to provide you with better performance and new features. 
                    Your data is safe and secure during this process.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card className="animate-fade-in-up animation-delay-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Need Immediate Assistance?
              </CardTitle>
              <CardDescription>
                Contact us if you have urgent inquiries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-pale-gray/50">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-charcoal mb-1">Email Support</p>
                    <a
                      href="mailto:support@agentforms.com?subject=Urgent%20Inquiry%20During%20Maintenance"
                      className="text-sm text-primary hover:underline"
                    >
                      support@agentforms.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-pale-gray/50">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-charcoal mb-1">Status Updates</p>
                    <p className="text-sm text-medium-gray">
                      Follow our status page for real-time updates on the maintenance progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-pale-gray">
                <p className="text-sm text-medium-gray mb-3">
                  We apologize for any inconvenience. Our team is working hard to restore service as quickly as possible.
                </p>
                <p className="text-sm text-medium-gray">
                  For urgent matters, please email us with "URGENT" in the subject line, and we'll prioritize your request.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => window.location.reload()}
            >
              <Clock className="h-4 w-4 mr-2" />
              Check Status
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
