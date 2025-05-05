"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

interface FileUploadProps {
  folderId?: string;
  onUploadComplete?: () => void;
}

export default function FileUpload({ folderId, onUploadComplete }: Readonly<FileUploadProps>) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (folderId) {
      formData.append("folderId", folderId);
    }

    try {
      // Simulate progress for better UX
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      await axios.post("/api/files", formData);

      clearInterval(interval);

      setUploadProgress(100);
      toast.success("File uploaded", {
        description: `${selectedFile.name} has been uploaded successfully.`,
      });

      // Reset and refresh
      setTimeout(() => {
        setSelectedFile(null);
        setUploading(false);
        setUploadProgress(0);
        if (onUploadComplete) {
          onUploadComplete();
        }
        router.refresh();
      }, 1000);
    } catch (error: any) {
      setUploading(false);
      toast.error("Upload failed", {
        description: error.message ?? "Something went wrong.",
      });
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-lg font-medium">
              {isDragActive ? "Drop the file here" : "Drag and drop a file, or click to select"}
            </p>
            <p className="text-sm text-gray-500">Max file size: 10MB</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div className="truncate">
                <p className="font-medium truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            {!uploading && (
              <Button variant="ghost" size="icon" onClick={cancelUpload}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={uploadFile}>
              Upload
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
