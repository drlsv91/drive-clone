"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateFolderDialog from "../components/CreateFolderDialog";
import FileUpload from "../components/FileUpload";
import BreadcrumbNav from "../components/BreadcrumbNav";
import { Button } from "@/components/ui/button";

export default function NewPage() {
  const [activeTab, setActiveTab] = useState("upload");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const router = useRouter();

  return (
    <div>
      <div className="mb-6">
        <BreadcrumbNav />
        <h1 className="text-2xl font-bold">Create New</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="folder">Create Folder</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-6">
            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-lg font-medium mb-4">Upload a file</h2>
              <FileUpload
                onUploadComplete={() => {
                  router.push("/dashboard");
                  router.refresh();
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="folder" className="pt-6">
            <div className="border rounded-lg p-6 bg-white">
              <h2 className="text-lg font-medium mb-4">Create a new folder</h2>
              <p className="text-gray-500 mb-6">
                Create a new folder to organize your files. You can create folders inside other folders to create a
                hierarchy.
              </p>
              <Button
                onClick={() => setIsCreateFolderOpen(true)}
                className="w-full cursor-pointer py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Folder
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onSuccess={() => {
          router.push("/dashboard");
          router.refresh();
        }}
      />
    </div>
  );
}
