import { FileText, Calendar, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLegalDocument } from '@/hooks/useLegal';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PrivacyPolicyPage() {
  const { data: document, isLoading, error } = useLegalDocument('privacy-policy');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl">
          <CardContent className="pt-6 text-center">
            <p className="text-medium-gray">
              Unable to load the Privacy Policy. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal">
              Privacy Policy
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-medium-gray">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              <span>Version {document.version}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                Effective: {format(new Date(document.effectiveDate), 'MMMM dd, yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <Card className="animate-fade-in-up animation-delay-100">
          <CardHeader>
            <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                'prose prose-sm md:prose-base max-w-none',
                'prose-headings:text-charcoal prose-headings:font-bold',
                'prose-p:text-medium-gray prose-p:leading-relaxed',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-charcoal prose-strong:font-semibold',
                'prose-ul:text-medium-gray prose-ol:text-medium-gray',
                'prose-li:text-medium-gray',
                'prose-hr:border-pale-gray',
                'prose-blockquote:border-l-primary prose-blockquote:bg-pale-gray/30',
                'prose-blockquote:text-charcoal prose-blockquote:pl-4 prose-blockquote:py-2',
                'prose-code:text-primary prose-code:bg-pale-gray prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
                'prose-pre:bg-charcoal prose-pre:text-white',
                'space-y-4'
              )}
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up animation-delay-200">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-pale-gray"
          >
            Go Back
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-pale-gray"
          >
            <a href="/legal/terms-of-service">Terms of Service</a>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-pale-gray"
          >
            <a href="/legal/cookie-policy">Cookie Policy</a>
          </Button>
          <Button
            variant="outline"
            asChild
            className="border-pale-gray"
          >
            <a href="/legal/data-processing-addendum">Data Processing Addendum</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
