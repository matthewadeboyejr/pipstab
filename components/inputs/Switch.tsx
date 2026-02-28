"use client";
import { cn } from "@/lib/utils";

interface BillingSwitchProps {
  value: "monthly" | "annually";
  onValueChange: (value: "monthly" | "annually") => void;
  className?: string;
}

export function BillingSwitch({
  value,
  onValueChange,
  className,
}: BillingSwitchProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-12 w-64 items-center rounded-full bg-background p-1",
        className
      )}
    >
      {/* Background slider */}
      <div
        className={cn(
          "absolute h-10 w-32 rounded-full bg-gradient-to-r from-purple-600 bg-accent transition-transform duration-200 ease-in-out",
          value === "annually" && "translate-x-32"
        )}
      />

      {/* Monthly option */}
      <button
        onClick={() => onValueChange("monthly")}
        className={cn(
          "pricing-switch-text relative z-10 flex h-10 w-32 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200",
          value === "monthly"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Monthly
      </button>

      {/* Annually option */}
      <button
        onClick={() => onValueChange("annually")}
        className={cn(
          "pricing-switch-text relative z-10 flex h-10 w-32 items-center justify-center rounded-full text-sm font-medium transition-colors duration-200",
          value === "annually"
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Annually
      </button>
    </div>
  );
}
