import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

/**
 * Button — primitivo apresentacional.
 *
 * Tom Piantare: pill (rounded-full), DM Sans 500, transições suaves
 * de translateY + sombra verde no hover. Sem azul, sem sombra preta.
 * Tokens semânticos via @theme em globals.css.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-full font-medium tracking-tight",
    "transition-[transform,background-color,box-shadow,color] duration-200 ease-out",
    "focus-visible:outline-none",
    "disabled:pointer-events-none disabled:opacity-55",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // Primário: verde-médio, escurece + eleva no hover.
        default: [
          "bg-primary text-primary-foreground shadow-[0_2px_10px_rgba(74,154,110,0.18)]",
          "hover:bg-[var(--piantare-gd)] hover:-translate-y-[1px]",
          "hover:shadow-[var(--piantare-shadow-cta)]",
        ].join(" "),
        // Destrutivo: terra clay calma, mesma ergonomia.
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:opacity-90 hover:-translate-y-[1px]",
        ].join(" "),
        // Outline: pill com borda verde clara, fundo transparente.
        outline: [
          "bg-transparent text-primary",
          "border border-[var(--piantare-gx)]",
          "hover:bg-[var(--piantare-gl)]",
        ].join(" "),
        // Secondary: verde claro, presença suave.
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-[var(--piantare-gx)]",
        ].join(" "),
        // Ghost: sem fundo até hover.
        ghost: [
          "text-foreground/80",
          "hover:bg-[var(--piantare-gl)] hover:text-foreground",
        ].join(" "),
        // Link: peso normal, underline no hover.
        link: "text-primary underline-offset-4 hover:underline rounded-none",
      },
      size: {
        // Pill generoso — padding horizontal alto, vertical confortável.
        default: "h-11 px-7 text-[14px]",
        sm: "h-9 px-5 text-[13px]",
        lg: "h-12 px-9 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
