import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePasswordReset, usePasswordResetConfirm } from "@/hooks/useAuth";
import { Mail, Lock, CheckCircle } from "lucide-react";

const resetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetConfirmSchema = z
  .object({
    new_password: z.string().min(6, "Password must be at least 6 characters"),
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
  const token = searchParams.get("token");
  const [requestSent, setRequestSent] = useState(false);
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
    formState: { errors: errorsConfirm },
  } = useForm<ResetConfirmForm>({
    resolver: zodResolver(resetConfirmSchema),
  });

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

  if (requestSent && !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full">Back to login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in-up">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
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
                    placeholder="••••••••"
                    className="pl-10"
                    {...registerConfirm("new_password")}
                  />
                </div>
                {errorsConfirm.new_password && (
                  <p className="text-sm text-deep-orange">
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
                    placeholder="••••••••"
                    className="pl-10"
                    {...registerConfirm("confirm_password")}
                  />
                </div>
                {errorsConfirm.confirm_password && (
                  <p className="text-sm text-deep-orange">
                    {errorsConfirm.confirm_password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={passwordResetConfirm.isPending}
              >
                {passwordResetConfirm.isPending ? "Resetting..." : "Reset password"}
              </Button>
            </form>

            {passwordResetConfirm.isSuccess && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Password reset successfully!</span>
              </div>
            )}

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitRequest(onSubmitRequest)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  {...registerRequest("email")}
                />
              </div>
              {errorsRequest.email && (
                <p className="text-sm text-deep-orange">{errorsRequest.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={passwordReset.isPending}
            >
              {passwordReset.isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
