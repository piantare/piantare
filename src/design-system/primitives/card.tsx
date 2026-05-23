import * as React from "react";

import { cn } from "@/lib/cn";

/**
 * Card — primitivo apresentacional.
 *
 * Tom Piantare: fundo warm, borda verde translúcida, hover suave
 * (translateY -2px + sombra verde leve). CardTitle em Cormorant
 * Garamond para sensação editorial.
 */

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-card text-card-foreground",
      "border-[var(--piantare-border)]",
      "transition-[transform,box-shadow,border-color] duration-250 ease-out",
      "hover:border-[var(--piantare-gx)]",
      "hover:-translate-y-[1px]",
      "hover:shadow-[var(--piantare-shadow)]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2 p-7 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/**
 * CardTitle usa Cormorant Garamond — tom editorial calmo. Tamanho
 * intencionalmente maior que o anterior (lg → xl/2xl) para hierarquia
 * tranquila sem peso.
 */
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "font-serif text-2xl font-normal leading-tight tracking-tight",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[14px] font-light leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-7 pt-4", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-7 pt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
