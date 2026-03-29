import { cn } from "@/lib/cn";
import { HTMLAttributes } from "react";

type BadgeVariant = "success" | "error" | "warning" | "orange" | "default";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ className, variant = "default", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
        {
          "bg-[#22C55E]/10 text-[#22C55E]": variant === "success",
          "bg-[#EF4444]/10 text-[#EF4444]": variant === "error",
          "bg-amber-500/10 text-amber-400": variant === "warning",
          "bg-[#F97316]/10 text-[#F97316]": variant === "orange",
          "bg-[#293548] text-[#94A3B8]": variant === "default",
        },
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", {
            "bg-[#22C55E]": variant === "success",
            "bg-[#EF4444]": variant === "error",
            "bg-amber-400": variant === "warning",
            "bg-[#F97316]": variant === "orange",
            "bg-[#64748B]": variant === "default",
          })}
        />
      )}
      {children}
    </span>
  );
}
