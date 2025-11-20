import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Under Maintenance</CardTitle>
          <CardDescription className="text-lg">
            We'll be back soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-medium-gray">
            We're currently performing scheduled maintenance. Please check back in a few minutes.
          </p>
          <p className="text-sm text-medium-gray">
            Estimated completion: 30 minutes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
