import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useVerifyEmail, useResendVerification, useCheckVerificationStatus } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Mail, CheckCircle, Clock, RefreshCw, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = searchParams.get("token");
  const [cooldown, setCooldown] = useState(0);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | undefined>();
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const { data: statusData, refetch: checkStatus, isLoading: isCheckingStatus } = useCheckVerificationStatus();

  // Calculate progress (0-100%)
  const progress = isVerified ? 100 : token ? 50 : 25;

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      cooldownIntervalRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownIntervalRef.current) {
              clearInterval(cooldownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
        cooldownIntervalRef.current = null;
      }
    }

    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [cooldown]);

  // Check if email is verified when status dialog opens
  useEffect(() => {
    if (showStatusDialog && !isCheckingStatus) {
      checkStatus();
    }
  }, [showStatusDialog, checkStatus, isCheckingStatus]);

  // Update verified state when status changes
  useEffect(() => {
    if (statusData) {
      setIsVerified(statusData.email_verified);
      if (statusData.email) {
        setVerificationEmail(statusData.email);
      }
    }
  }, [statusData]);

  // Handle email verification with token
  const handleVerify = () => {
    if (token) {
      verifyEmail.mutate(token, {
        onSuccess: () => {
          setIsVerified(true);
          queryClient.invalidateQueries({ queryKey: ['auth', 'verification-status'] });
          queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        },
      });
    }
  };

  // Handle resend verification email
  const handleResend = () => {
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        setCooldown(60); // 60 second cooldown
      },
    });
  };

  // Handle check verification status
  const handleCheckStatus = () => {
    setShowStatusDialog(true);
    checkStatus();
  };

  // Handle successful verification redirect
  const handleContinue = () => {
    if (isVerified) {
      navigate("/dashboard");
    } else {
      setShowStatusDialog(false);
    }
  };

  // If verified and no token, show success state
  if (isVerified && !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Email Verified!</CardTitle>
            <CardDescription>
              Your email address has been successfully verified. You can now access all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={100} className="h-2" />
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Continue to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-medium-gray">Verification Progress</span>
                <span className="font-medium text-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Verification Instructions */}
            <div className="rounded-lg bg-pale-gray/50 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-foreground">Next Steps:</h3>
              <ol className="space-y-2 text-sm text-medium-gray list-decimal list-inside">
                <li>Check your email inbox for a verification message</li>
                <li>Click the verification link in the email</li>
                <li>You'll be automatically redirected once verified</li>
              </ol>
              <div className="pt-2 border-t border-pale-gray">
                <p className="text-xs text-medium-gray">
                  <strong>Tip:</strong> Don't see the email? Check your spam or junk folder.
                </p>
              </div>
            </div>

            {/* Token-based verification (if token in URL) */}
            {token ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-medium-gray bg-light-orange/10 p-3 rounded-lg border border-light-orange/20">
                  <Clock className="h-4 w-4 text-light-orange" />
                  <span>Verification link detected. Click below to verify.</span>
                </div>
                <Button
                  onClick={handleVerify}
                  className="w-full"
                  disabled={verifyEmail.isPending || isVerified}
                >
                  {verifyEmail.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : isVerified ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verified
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </Button>
                {verifyEmail.isSuccess && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4" />
                    <span>Email verified successfully! Redirecting...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Check Status Button */}
                <Button
                  onClick={handleCheckStatus}
                  variant="outline"
                  className="w-full"
                  disabled={isCheckingStatus}
                >
                  {isCheckingStatus ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Verification Status
                    </>
                  )}
                </Button>

                {/* Resend Email Button */}
                <Button
                  onClick={handleResend}
                  variant="secondary"
                  className="w-full"
                  disabled={cooldown > 0 || resendVerification.isPending}
                >
                  {cooldown > 0 ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Resend in {cooldown}s
                    </>
                  ) : resendVerification.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Support Section */}
            <div className="pt-4 border-t border-pale-gray space-y-3">
              <div className="flex items-start gap-2 text-sm text-medium-gray">
                <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="mb-2">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={handleResend}
                      disabled={cooldown > 0}
                      className={cn(
                        "text-primary hover:underline font-medium",
                        cooldown > 0 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      resend
                    </button>
                    .
                  </p>
                  <p>
                    Still having trouble?{" "}
                    <a
                      href="mailto:support@agentforms.com"
                      className="text-primary hover:underline font-medium"
                    >
                      Contact support
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:underline font-medium"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Status Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {isVerified ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Mail className="h-6 w-6 text-primary" />
              )}
            </div>
            <DialogTitle className="text-center">
              {isVerified ? "Email Verified!" : "Verification Pending"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isVerified ? (
                <>
                  Your email address{verificationEmail && ` (${verificationEmail})`} has been successfully verified.
                  You can now access all features of the platform.
                </>
              ) : (
                <>
                  Your email address{verificationEmail && ` (${verificationEmail})`} has not been verified yet.
                  Please check your inbox and click the verification link.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isVerified ? (
              <Button onClick={handleContinue} className="w-full sm:w-auto">
                Continue to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowStatusDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowStatusDialog(false);
                    handleResend();
                  }}
                  className="w-full sm:w-auto"
                  disabled={cooldown > 0 || resendVerification.isPending}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Email
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
