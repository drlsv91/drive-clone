import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function getFileTypeIcon(type: string) {
  if (type.startsWith("image/")) {
    return "image";
  } else if (type.startsWith("video/")) {
    return "video";
  } else if (type.startsWith("audio/")) {
    return "audio";
  } else if (type === "application/pdf") {
    return "pdf";
  } else if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    type === "application/msword"
  ) {
    return "word";
  } else if (
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel"
  ) {
    return "excel";
  } else if (
    type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    type === "application/vnd.ms-powerpoint"
  ) {
    return "powerpoint";
  } else if (type === "application/zip" || type === "application/x-zip-compressed") {
    return "zip";
  } else {
    return "file";
  }
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

interface ApiError {
  message?: string;
  response?: {
    data?: {
      error?: string;
    };
  };
}

export function showError(error: unknown, title: string = "Error") {
  if (error instanceof Error) {
    toast.error(title, { description: error.message ?? "An unexpected error occurred. Please try again." });
  } else if (typeof error === "object" && error && "response" in error) {
    const errorMessage = error as ApiError;
    toast.error(title, { description: errorMessage.response?.data?.error });
  } else {
    toast.error(title, { description: "An unexpected error occurred. Please try again." });
  }
}
