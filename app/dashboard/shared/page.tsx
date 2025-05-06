import { Users } from "lucide-react";
import { Suspense } from "react";
import BreadcrumbNav from "../components/BreadcrumbNav";
import FileGrid from "../components/FileGrid";
import FolderCard from "../components/FolderCard";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { Metadata } from "next";

export default async function SharedPage() {
  const currentUser = await requireAuth();

  // [TODO] implement a robust share features
  const sharedItems = await prisma.sharedItem.findMany({ where: { sharedWithEmail: currentUser.email } });

  const sharedFolders = await prisma.folder.findMany({
    where: {
      id: {
        in: sharedItems.filter((item) => item.folderId).map((item) => item.folderId!),
      },
    },
  });

  const sharedFiles = await prisma.file.findMany({
    where: {
      userId: currentUser.id,
      id: {
        in: sharedItems.filter((item) => item.fileId).map((item) => item.fileId!),
      },
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <BreadcrumbNav />
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Shared with me</h1>
          </div>
        </div>
      </div>

      <Suspense fallback={<div>Loading shared items...</div>}>
        {sharedFolders.length === 0 && sharedFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Users className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No shared items</h3>
            <p className="mt-1 text-sm text-gray-500">Files and folders shared with you will appear here.</p>
            <p className="mt-4 text-xs text-gray-500">
              Note: The sharing functionality is not fully implemented in this demo.
            </p>
          </div>
        ) : (
          <>
            {sharedFolders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sharedFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      id={folder.id}
                      name={folder.name}
                      isRoot={folder.isRoot}
                      createdAt={folder.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </div>
            )}

            {sharedFiles.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Files</h2>
                <FileGrid
                  files={sharedFiles.map((file) => ({
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: file.url,
                    thumbnailUrl: file.thumbnailUrl ?? undefined,
                    createdAt: file.createdAt.toISOString(),
                  }))}
                />
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  title: "DriveClone -  Sharred List",
  description: "drive clone view shared items",
};
