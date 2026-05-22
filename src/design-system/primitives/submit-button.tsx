"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "./button";

type SubmitButtonProps = Omit<ButtonProps, "type"> & {
  /** Label shown while the form action is pending. Defaults to "Enviando…". */
  pendingLabel?: string;
};

/**
 * Form submit button that reflects the pending state of its enclosing
 * Server Action automatically.
 *
 * Reads `useFormStatus()` from React 19 — must be a *descendant* of a
 * `<form action={...}>`. While pending, the button is disabled and shows
 * `pendingLabel` instead of its children, so the user gets immediate visual
 * feedback that their action is in flight (smoke test pain point P6).
 */
export function SubmitButton({
  pendingLabel = "Enviando…",
  children,
  disabled,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...rest}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
