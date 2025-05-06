"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBytes, showError } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

interface DragDropZoneProps {
  folderId?: string;
  onUploadComplete?: () => void;
}

export default function DragDropZone({ folderId, onUploadComplete }: Readonly<DragDropZoneProps>) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);

  const router = useRouter();

  useEffect(() => {
    setSelectedFiles([]);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Initialize progress for each file
    const initialProgress = acceptedFiles.reduce((acc, file) => {
      acc[file.name] = 0;
      return acc;
    }, {} as { [key: string]: number });

    setUploadProgress(initialProgress);
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setTotalProgress(0);

    let completedFiles = 0;
    const totalFiles = selectedFiles.length;

    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (folderId) {
          formData.append("folderId", folderId);
        }

        // Simulate progress for better UX
        const updateProgress = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[file.name] || 0;
            if (currentProgress >= 95) {
              clearInterval(updateProgress);
              return prev;
            }

            const newProgress = { ...prev, [file.name]: currentProgress + 5 };

            // Update total progress
            const progressSum = Object.values(newProgress).reduce((sum, p) => sum + p, 0);
            const newTotalProgress = (progressSum / (totalFiles * 100)) * 100;
            setTotalProgress(newTotalProgress);

            return newProgress;
          });
        }, 100);

        await axios.post("/api/files", formData);

        clearInterval(updateProgress);

        // Set progress to 100%
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

        completedFiles++;
        setTotalProgress((completedFiles / totalFiles) * 100);
      } catch (error: unknown) {
        showError(error);

        // Set failed file progress to 0
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      }
    }

    // All uploads completed
    toast.success("Files uploaded", {
      description: `${completedFiles} of ${totalFiles} files uploaded successfully.`,
    });

    // Reset and refresh
    setTimeout(() => {
      setSelectedFiles([]);
      setUploading(false);
      setUploadProgress({});
      setTotalProgress(0);

      if (onUploadComplete) {
        onUploadComplete();
      }

      router.refresh();
    }, 1000);
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  return (
    <div className="w-full space-y-4">
      {selectedFiles.length === 0 ? (
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
              {isDragActive ? "Drop the files here" : "Drag and drop files, or click to select"}
            </p>
            <p className="text-sm text-gray-500">Max file size: 10MB</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
            {!uploading && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedFiles([])}>
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {selectedFiles.map((file) => (
              <div key={file.name} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                    <FileUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="truncate max-w-xs">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {uploading ? (
                    <div className="w-20">
                      <Progress value={uploadProgress[file.name] || 0} className="h-1.5" />
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {Math.round(uploadProgress[file.name] || 0)}%
                      </p>
                    </div>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => removeFile(file.name)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {uploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Progress</span>
                <span className="text-sm">{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
              <div className="flex justify-center">
                <div className="text-center flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </div>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={uploadFiles}>
              Upload {selectedFiles.length} {selectedFiles.length === 1 ? "file" : "files"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
