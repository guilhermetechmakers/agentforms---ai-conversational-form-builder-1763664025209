import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useVerifyEmail, useResendVerification } from "@/hooks/useAuth";
import { Mail, CheckCircle, Clock } from "lucide-react";

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [cooldown, setCooldown] = useState(0);
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();

  const handleVerify = () => {
    if (token) {
      verifyEmail.mutate(token);
    }
  };

  const handleResend = () => {
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Verify your email
          </CardTitle>
          <CardDescription>
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {token ? (
            <div className="space-y-4">
              <Button onClick={handleVerify} className="w-full" disabled={verifyEmail.isPending}>
                {verifyEmail.isPending ? "Verifying..." : "Verify Email"}
              </Button>
              {verifyEmail.isSuccess && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Email verified successfully!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-medium-gray">
                <Clock className="h-4 w-4" />
                <span>Waiting for verification...</span>
              </div>
              <Button
                onClick={handleResend}
                variant="outline"
                className="w-full"
                disabled={cooldown > 0 || resendVerification.isPending}
              >
                {cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : resendVerification.isPending
                  ? "Sending..."
                  : "Resend verification email"}
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-pale-gray">
            <p className="text-sm text-center text-medium-gray">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={handleResend}
                disabled={cooldown > 0}
                className="text-primary hover:underline"
              >
                resend
              </button>
            </p>
          </div>

          <div className="pt-4 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
