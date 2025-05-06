"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFolders } from "@/hooks/useFolders";
import { ArrowLeft, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import BreadcrumbNav from "../components/BreadcrumbNav";
import DragDropZone from "../components/DragDropZone";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("upload");
  const { folders, fetchFolders } = useFolders();

  const router = useRouter();

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleUploadComplete = () => {
    setUploading(false);
    toast.success("Upload complete", {
      description: "All files have been uploaded successfully.",
    });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <BreadcrumbNav />
      </div>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Files</h1>

        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="import">Import from URL</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-6">
            <div className="border rounded-lg p-6 bg-white mb-4">
              <h2 className="text-lg font-medium mb-4">Select destination folder</h2>

              <Select value={selectedFolder ?? ""} onValueChange={(value) => setSelectedFolder(value)}>
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="My Drive (root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no drive" disabled={uploading}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span>My Drive (root)</span>
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id} disabled={uploading}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        <span>{folder.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DragDropZone folderId={selectedFolder ?? undefined} onUploadComplete={handleUploadComplete} />
            </div>

            <div className="text-sm text-gray-500">
              <p>Max file size: 10MB per file</p>
              <p>Supported file types: Images, documents, videos, audio, and more</p>
            </div>
          </TabsContent>

          <TabsContent value="import" className="pt-6">
            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-lg font-medium mb-4">Import files from URL</h2>
              <p className="text-gray-500 mb-6">
                Coming soon! This feature will allow you to import files directly from URLs.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
