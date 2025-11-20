import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { use2FASetup, useVerify2FASetup } from "@/hooks/useAuth";
import { CheckCircle, Copy, Download, Loader2, QrCode, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const verifyCodeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

type VerifyCodeForm = z.infer<typeof verifyCodeSchema>;

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: setupData, isLoading: isLoadingSetup } = use2FASetup();
  const verify2FA = useVerify2FASetup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeForm>({
    resolver: zodResolver(verifyCodeSchema),
  });

  // Handle verification
  const onVerify = (data: VerifyCodeForm) => {
    verify2FA.mutate(data.code, {
      onSuccess: (response) => {
        if (response.backup_codes) {
          setBackupCodes(response.backup_codes);
          setStep("backup");
        } else if (setupData?.backup_codes) {
          setBackupCodes(setupData.backup_codes);
          setStep("backup");
        } else {
          // No backup codes, complete setup
          if (onComplete) {
            onComplete();
          }
        }
      },
    });
  };

  // Copy backup code to clipboard
  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Backup code copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = `AgentForms 2FA Backup Codes\n\nSave these codes in a safe place. Each code can only be used once.\n\n${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentforms-2fa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded!");
  };

  // Copy all backup codes
  const copyAllBackupCodes = () => {
    const text = backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    toast.success("All backup codes copied!");
  };

  if (isLoadingSetup) {
    return (
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!setupData) {
    return (
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardContent className="py-12 text-center">
          <p className="text-medium-gray">Failed to load 2FA setup data. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // QR Code Step
  if (step === "qr") {
    return (
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <QrCode className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Set up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-lg border-2 border-pale-gray p-4 bg-white">
              <img
                src={setupData.qr_code_url}
                alt="2FA QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Can't scan? Enter this code manually:</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-4 py-2 bg-pale-gray rounded-lg text-sm font-mono break-all">
                {setupData.secret}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(setupData.secret);
                  toast.success("Secret copied!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-lg bg-pale-gray/50 p-4 space-y-2 text-sm text-medium-gray">
            <p className="font-medium text-foreground">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open your authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>Scan the QR code or enter the secret manually</li>
              <li>Enter the 6-digit code from your app to verify</li>
            </ol>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              className="flex-1"
              onClick={() => setStep("verify")}
            >
              I've scanned the code
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verification Step
  if (step === "verify") {
    return (
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Setup</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                {...register("code")}
                autoFocus
                autoComplete="off"
              />
              {errors.code && (
                <p className="text-sm text-deep-orange animate-fade-in">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep("qr")}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={verify2FA.isPending}
              >
                {verify2FA.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </div>
          </form>

          {verify2FA.isError && (
            <div className="rounded-lg bg-deep-orange/10 border border-deep-orange/20 p-3 text-sm text-deep-orange">
              Verification failed. Please check your code and try again.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Backup Codes Step
  return (
    <Card className="w-full max-w-md animate-fade-in-up">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">2FA Enabled Successfully!</CardTitle>
        <CardDescription>
          Save these backup codes in a safe place
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-pale-gray/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Backup Codes</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyAllBackupCodes}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={downloadBackupCodes}
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-2 bg-white rounded border border-pale-gray",
                  copiedCode === code && "border-primary"
                )}
              >
                <code className="text-sm font-mono">{code}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyBackupCode(code)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-light-orange/10 border border-light-orange/20 p-4 space-y-2 text-sm">
          <p className="font-medium text-foreground">Important:</p>
          <ul className="list-disc list-inside space-y-1 text-medium-gray">
            <li>Each backup code can only be used once</li>
            <li>Store these codes in a secure location</li>
            <li>You can generate new codes in Settings if needed</li>
          </ul>
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={() => {
            if (onComplete) {
              onComplete();
            }
          }}
        >
          Done
        </Button>
      </CardContent>
    </Card>
  );
}
