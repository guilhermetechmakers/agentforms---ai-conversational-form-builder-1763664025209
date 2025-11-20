import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-6xl font-bold">500</CardTitle>
          <CardDescription className="text-lg">
            Internal Server Error
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-medium-gray">
            Something went wrong on our end. Please try again later.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Link to="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
