import { useState } from "react";
import { toast } from "sonner";

/**
 * Custom hook for clipboard operations
 */
export const useClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== "undefined") {
        await navigator.clipboard.writeText(text);
      }

      setCopied(true);

      toast.success("Copied to clipboard");

      setTimeout(() => {
        setCopied(false);
      }, 3000);

      return true;
    } catch (error: any) {
      toast.error(error.message ?? "Failed to copy");
      return false;
    }
  };

  return {
    copied,
    copyToClipboard,
  };
};
