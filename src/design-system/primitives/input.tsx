import * as React from "react";

import { cn } from "@/lib/cn";

/**
 * Input — primitivo apresentacional.
 *
 * Tom Piantare: fundo warm (--piantare-warm), borda verde translúcida,
 * focus que clareia o fundo para branco e adiciona ring verde leve.
 * Padding generoso, sem sombra preta.
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg px-4 py-2.5",
        "text-[14px] font-light text-foreground",
        "bg-[var(--piantare-warm)]",
        "border border-[var(--piantare-border)]",
        "placeholder:text-[var(--piantare-dim)]",
        "transition-[background-color,border-color,box-shadow] duration-200 ease-out",
        "focus-visible:outline-none",
        "focus-visible:bg-[var(--piantare-white)]",
        "focus-visible:border-[var(--piantare-gm)]",
        "focus-visible:shadow-[var(--piantare-shadow-focus)]",
        "disabled:cursor-not-allowed disabled:opacity-55",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
