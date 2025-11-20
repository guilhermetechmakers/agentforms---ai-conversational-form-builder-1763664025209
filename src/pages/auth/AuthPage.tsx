import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordStrengthMeter } from "@/components/ui/password-strength-meter";
import { useSignIn, useSignUp } from "@/hooks/useAuth";
import { Mail, Lock, User, Chrome } from "lucide-react";
import { authApi } from "@/api/auth";
import { cn } from "@/lib/utils";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional(),
});

// Signup schema
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Determine initial mode from URL path
  const initialMode = location.pathname === "/signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const signIn = useSignIn();
  const signUp = useSignUp();

  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember_me: false,
    },
  });

  // Signup form
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      terms_accepted: false,
    },
  });

  const passwordValue = signupForm.watch("password");

  // Update mode when route changes
  useEffect(() => {
    const newMode = location.pathname === "/signup" ? "signup" : "login";
    if (newMode !== mode) {
      setIsTransitioning(true);
      setTimeout(() => {
        setMode(newMode);
        setIsTransitioning(false);
        // Reset forms when switching
        loginForm.reset();
        signupForm.reset();
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, mode]);

  const handleModeToggle = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setIsTransitioning(true);
    // Navigate to the appropriate route
    navigate(newMode === "signup" ? "/signup" : "/login", { replace: true });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 150);
  };

  const onLoginSubmit = (data: LoginForm) => {
    signIn.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard");
      },
    });
  };

  const onSignupSubmit = (data: SignupForm) => {
    signUp.mutate(data, {
      onSuccess: () => {
        navigate("/verify-email");
      },
    });
  };

  const handleOAuth = (provider: "google" | "microsoft") => {
    authApi.signInWithOAuth(provider);
  };

  const isLoading = signIn.isPending || signUp.isPending;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1">
          {/* Toggle Switch */}
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center bg-pale-gray rounded-full p-1 gap-1">
              <button
                type="button"
                onClick={() => mode !== "login" && handleModeToggle()}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  mode === "login"
                    ? "bg-primary text-white shadow-md scale-105"
                    : "text-medium-gray hover:text-foreground"
                )}
                disabled={isLoading}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => mode !== "signup" && handleModeToggle()}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  mode === "signup"
                    ? "bg-primary text-white shadow-md scale-105"
                    : "text-medium-gray hover:text-foreground"
                )}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-center">
            {mode === "signup" ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "signup"
              ? "Enter your details to create your account"
              : "Enter your email to sign in to your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Login Form */}
          {mode === "login" && (
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className={cn(
                "space-y-4 transition-opacity duration-200",
                isTransitioning ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-deep-orange">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginForm.register("password")}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-deep-orange">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember_me"
                    checked={loginForm.watch("remember_me")}
                    onCheckedChange={(checked) =>
                      loginForm.setValue("remember_me", checked === true)
                    }
                  />
                  <Label
                    htmlFor="remember_me"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {mode === "signup" && (
            <form
              onSubmit={signupForm.handleSubmit(onSignupSubmit)}
              className={cn(
                "space-y-4 transition-opacity duration-200",
                isTransitioning ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name (Optional)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    {...signupForm.register("full_name")}
                  />
                </div>
                {signupForm.formState.errors.full_name && (
                  <p className="text-sm text-deep-orange">
                    {signupForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    {...signupForm.register("email")}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-sm text-deep-orange">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medium-gray" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signupForm.register("password")}
                  />
                </div>
                {passwordValue && (
                  <PasswordStrengthMeter password={passwordValue} />
                )}
                {signupForm.formState.errors.password && (
                  <p className="text-sm text-deep-orange animate-fade-in">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
                <p className="text-xs text-medium-gray">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms_accepted"
                  checked={signupForm.watch("terms_accepted")}
                  onCheckedChange={(checked) =>
                    signupForm.setValue("terms_accepted", checked === true)
                  }
                  className="mt-1"
                />
                <Label
                  htmlFor="terms_accepted"
                  className="text-sm leading-tight font-normal cursor-pointer"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {signupForm.formState.errors.terms_accepted && (
                <p className="text-sm text-deep-orange">
                  {signupForm.formState.errors.terms_accepted.message}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}

          {/* OAuth Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-pale-gray" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-medium-gray">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("google")}
                className="w-full"
                disabled={isLoading}
              >
                <Chrome className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuth("microsoft")}
                className="w-full"
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-4 w-4 shrink-0"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0" y="0" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="0" width="10" height="10" fill="#7FBA00" />
                  <rect x="0" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                Microsoft
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center text-xs text-medium-gray">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:underline font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
