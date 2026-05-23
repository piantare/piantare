"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/**
 * Label — primitivo apresentacional (Radix-based para a11y).
 *
 * Tom Piantare: DM Sans 500, tamanho pequeno, uppercase com tracking
 * generoso. Comunica hierarquia editorial sem peso visual.
 */
const labelVariants = cva(
  [
    "text-[11px] font-medium uppercase",
    "tracking-[0.18em]",
    "text-[var(--piantare-muted)]",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  ].join(" "),
);

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
