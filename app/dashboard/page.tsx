import { Suspense } from "react";
import ActionButtons from "./components/ActionButtons";
import FileCard from "./components/FileCard";
import FolderCard from "./components/FolderCard";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/server-auth";

export default async function Dashboard() {
  const currentUser = await requireAuth();

  const rootFolder = await prisma.folder.findFirst({
    where: {
      userId: currentUser.id,
      isRoot: true,
    },
  });

  if (!rootFolder) {
    await prisma.folder.create({
      data: {
        name: "Root",
        isRoot: true,
        userId: currentUser.id,
      },
    });
  }

  const folders = await prisma.folder.findMany({
    where: {
      userId: currentUser.id,
      parentId: null,
      isTrash: false,
    },
    orderBy: {
      name: "asc",
    },
  });

  const files = await prisma.file.findMany({
    where: {
      userId: currentUser.id,
      folderId: null,
      isTrash: false,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Drive</h1>
        <ActionButtons />
      </div>

      <Suspense fallback={<div>Loading folders and files...</div>}>
        {folders.length === 0 && files.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No files or folders yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new folder or uploading a file.</p>
            <div className="mt-6">
              <ActionButtons onAction={() => {}} />
            </div>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => (
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

            {files.length > 0 && (
              <div>
                <h2 className="text-lg font-medium mb-4">Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      id={file.id}
                      name={file.name}
                      type={file.type}
                      size={file.size}
                      url={file.url}
                      thumbnailUrl={file.thumbnailUrl ?? undefined}
                      createdAt={file.createdAt.toISOString()}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Suspense>
    </div>
  );
}

export const dynamic = "force-dynamic"; //opt-out of static rendering
