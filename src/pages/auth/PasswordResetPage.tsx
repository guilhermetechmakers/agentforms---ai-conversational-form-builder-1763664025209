import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { usePasswordReset, usePasswordResetConfirm } from "@/hooks/useAuth";
import { Mail, Lock, CheckCircle, ArrowLeft, Shield } from "lucide-react";

const resetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetConfirmSchema = z
  .object({
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ResetRequestForm = z.infer<typeof resetRequestSchema>;
type ResetConfirmForm = z.infer<typeof resetConfirmSchema>;

export function PasswordResetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [requestSent, setRequestSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const passwordReset = usePasswordReset();
  const passwordResetConfirm = usePasswordResetConfirm();

  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest },
  } = useForm<ResetRequestForm>({
    resolver: zodResolver(resetRequestSchema),
  });

  const {
    register: registerConfirm,
    handleSubmit: handleSubmitConfirm,
    watch,
    formState: { errors: errorsConfirm },
  } = useForm<ResetConfirmForm>({
    resolver: zodResolver(resetConfirmSchema),
  });

  const passwordValue = watch("new_password");

  // Redirect to login after successful reset
  useEffect(() => {
    if (passwordResetConfirm.isSuccess && !resetSuccess) {
      setResetSuccess(true);
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [passwordResetConfirm.isSuccess, navigate, resetSuccess]);

  const onSubmitRequest = (data: ResetRequestForm) => {
    passwordReset.mutate(data.email, {
      onSuccess: () => {
        setRequestSent(true);
      },
    });
  };

  const onSubmitConfirm = (data: ResetConfirmForm) => {
    if (token) {
      passwordResetConfirm.mutate({
        token,
        newPassword: data.new_password,
        confirmPassword: data.confirm_password,
      });
    }
  };

  // Success state after email sent
  if (requestSent && !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-scale-in">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-medium-gray">
              We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-pale-gray/50 p-4 text-sm text-medium-gray">
              <p className="font-medium mb-1">Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state after password reset
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-bounce-in">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Password reset successfully!</CardTitle>
            <CardDescription className="text-medium-gray">
              Your password has been updated. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">
                Continue to login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset form (with token)
  if (token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center text-medium-gray">
              Enter your new password below. Make sure it's strong and secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConfirm(onSubmitConfirm)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="new_password"
                    type="password"
                    placeholder="Enter your new password"
                    className="pl-10"
                    {...registerConfirm("new_password")}
                    autoFocus
                  />
                </div>
                {passwordValue && (
                  <PasswordStrengthMeter password={passwordValue} />
                )}
                {errorsConfirm.new_password && (
                  <p className="text-sm text-deep-orange animate-fade-in">
                    {errorsConfirm.new_password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Confirm your new password"
                    className="pl-10"
                    {...registerConfirm("confirm_password")}
                  />
                </div>
                {errorsConfirm.confirm_password && (
                  <p className="text-sm text-deep-orange animate-fade-in">
                    {errorsConfirm.confirm_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={passwordResetConfirm.isPending}
              >
                {passwordResetConfirm.isPending ? "Resetting password..." : "Reset password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:underline inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Request reset form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center text-medium-gray">
            Enter your email address and we'll send you a secure link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest(onSubmitRequest)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  {...registerRequest("email")}
                  autoFocus
                />
              </div>
              {errorsRequest.email && (
                <p className="text-sm text-deep-orange animate-fade-in">
                  {errorsRequest.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={passwordReset.isPending}
            >
              {passwordReset.isPending ? "Sending reset link..." : "Send reset link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to login
            </Link>
          </div>

          <div className="mt-6 rounded-lg bg-pale-gray/50 p-4 text-xs text-medium-gray">
            <p className="font-medium mb-1">Security tip:</p>
            <p>We'll send a secure link to your email. The link will expire in 1 hour for your security.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
