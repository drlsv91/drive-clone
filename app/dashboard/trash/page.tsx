import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";
import { Trash2 } from "lucide-react";
import { Suspense } from "react";
import FileGrid from "../components/FileGrid";
import FolderCard from "../components/FolderCard";
import TrashHeader from "./TrashHeader";

export default async function TrashPage() {
  const currentUser = await requireAuth();

  // Get trashed folders
  const trashedFolders = await prisma.folder.findMany({
    where: {
      userId: currentUser.id,
      isTrash: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Get trashed files
  const trashedFiles = await prisma.file.findMany({
    where: {
      userId: currentUser.id,
      isTrash: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div>
      <TrashHeader />
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
        <p className="text-amber-800 text-sm">
          Items in trash will be automatically deleted after 30 days. You can restore items or delete them permanently.
        </p>
      </div>

      <Suspense fallback={<div>Loading trashed items...</div>}>
        {trashedFolders.length === 0 && trashedFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Trash2 className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Trash is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Items that you delete will appear here.</p>
          </div>
        ) : (
          <>
            {trashedFolders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trashedFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      id={folder.id}
                      name={folder.name}
                      isRoot={folder.isRoot}
                      createdAt={folder.createdAt}
                    />
                  ))}
                </div>
              </div>
            )}

            {trashedFiles.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Files</h2>
                <FileGrid
                  files={trashedFiles.map((file) => ({
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
