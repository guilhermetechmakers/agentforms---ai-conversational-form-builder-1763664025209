import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

type StrengthLevel = "weak" | "fair" | "good" | "strong";

interface StrengthConfig {
  level: StrengthLevel;
  label: string;
  color: string;
  bgColor: string;
  percentage: number;
}

const getPasswordStrength = (password: string): StrengthConfig => {
  if (!password) {
    return {
      level: "weak",
      label: "",
      color: "bg-pale-gray",
      bgColor: "bg-pale-gray/20",
      percentage: 0,
    };
  }

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  strength += checks.length ? 1 : 0;
  strength += checks.lowercase ? 1 : 0;
  strength += checks.uppercase ? 1 : 0;
  strength += checks.number ? 1 : 0;
  strength += checks.special ? 1 : 0;

  if (strength <= 2) {
    return {
      level: "weak",
      label: "Weak",
      color: "bg-deep-orange",
      bgColor: "bg-deep-orange/20",
      percentage: 25,
    };
  } else if (strength === 3) {
    return {
      level: "fair",
      label: "Fair",
      color: "bg-soft-yellow",
      bgColor: "bg-soft-yellow/20",
      percentage: 50,
    };
  } else if (strength === 4) {
    return {
      level: "good",
      label: "Good",
      color: "bg-light-blue",
      bgColor: "bg-light-blue/20",
      percentage: 75,
    };
  } else {
    return {
      level: "strong",
      label: "Strong",
      color: "bg-green-500",
      bgColor: "bg-green-500/20",
      percentage: 100,
    };
  }
};

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-medium-gray">Password strength</span>
        <span
          className={cn(
            "font-medium transition-colors duration-200",
            strength.level === "weak" && "text-deep-orange",
            strength.level === "fair" && "text-soft-yellow",
            strength.level === "good" && "text-light-blue",
            strength.level === "strong" && "text-green-500"
          )}
        >
          {strength.label}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-pale-gray">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            strength.color
          )}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-medium-gray">
        <span className={cn(password.length >= 8 && "text-green-500")}>
          {password.length >= 8 ? "✓" : "○"} 8+ characters
        </span>
        <span className={cn(/[a-z]/.test(password) && "text-green-500")}>
          {/[a-z]/.test(password) ? "✓" : "○"} Lowercase
        </span>
        <span className={cn(/[A-Z]/.test(password) && "text-green-500")}>
          {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase
        </span>
        <span className={cn(/[0-9]/.test(password) && "text-green-500")}>
          {/[0-9]/.test(password) ? "✓" : "○"} Number
        </span>
        <span className={cn(/[^A-Za-z0-9]/.test(password) && "text-green-500")}>
          {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Special
        </span>
      </div>
    </div>
  );
}
