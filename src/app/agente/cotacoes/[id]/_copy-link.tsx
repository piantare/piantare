"use client";

import * as React from "react";

import { Button } from "@/design-system";

type Props = {
  url: string;
};

/**
 * Botão "copiar link da cotação" — ação central do agente.
 * Confirmação inline (2s) sem toast/snackbar — sensação calma.
 */
export function CopyLinkButton({ url }: Props) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select all in a hidden input
      window.prompt("Copie o link:", url);
    }
  }

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <Button type="button" onClick={handleCopy}>
      {copied ? "Link copiado ✓" : "Copiar link"}
    </Button>
  );
}
