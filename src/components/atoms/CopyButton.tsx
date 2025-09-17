"use client";

import { useCallback, useState } from "react";
import { toast } from "react-toastify";

import { Button, type ButtonProps } from "@/components/atoms/Button";

export type CopyButtonProps = Omit<ButtonProps, "onClick"> & {
  getText: () => string;
  successMessage?: string;
  errorMessage?: string;
  onCopied?: () => void;
};

export const CopyButton = ({
  getText,
  successMessage = "Task list copied",
  errorMessage = "Unable to copy",
  onCopied,
  disabled,
  loading,
  ...props
}: CopyButtonProps) => {
  const [isCopying, setIsCopying] = useState(false);

  const copyText = useCallback(async () => {
    if (isCopying) return;
    setIsCopying(true);
    const text = getText();

    const fallbackCopy = (value: string) => {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
      } catch {
        return false;
      }
    };

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (!fallbackCopy(text)) {
        throw new Error("Clipboard not available");
      }
      toast.success(successMessage);
      onCopied?.();
    } catch (error) {
      console.error("Copy failed", error);
      toast.error(errorMessage);
    } finally {
      setIsCopying(false);
    }
  }, [errorMessage, getText, isCopying, onCopied, successMessage]);

  return (
    <Button
      type="button"
      onClick={copyText}
      loading={loading ?? isCopying}
      disabled={disabled}
      {...props}
    />
  );
};

